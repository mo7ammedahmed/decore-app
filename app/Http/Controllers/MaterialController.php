<?php

namespace App\Http\Controllers;

use App\Enums\Unit;
use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\UpdateMaterialRequest;
use App\Models\Classification;
use App\Models\Material;
use App\Models\Supplier;
use App\Services\AuditService;
use App\Services\CostHistoryService;
use App\Services\CurrencyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MaterialController extends Controller
{
     use AuthorizesRequests;
    public function __construct(
        private readonly CostHistoryService $costHistory,
        private readonly CurrencyService $currencies,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Material::class);

        $user = $request->user();

        // Supplier costs are sensitive — never ship them to non-finance roles.
        $materials = Material::query()
            ->with(['supplier:id,name', 'classification:id,name_en,name_ar'])
            ->when(! $user->role->canManageCosts(), fn ($q) => $q->select([
                'id', 'supplier_id', 'classification_id', 'name_en', 'name_ar', 'slug', 'sku', 'description',
                'unit', 'selling_price', 'currency_code', 'stock_quantity', 'minimum_stock_level',
                'is_active', 'image_path', 'image_disk', 'image_alt_text', 'created_at', 'updated_at',
            ]))
            ->when($user->isSupplier(), fn ($q) => $q->where('supplier_id', $user->supplier_id))
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where(fn ($inner) => $inner
                    ->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")))
            ->when($request->query('classification'), fn ($q, $id) => $q->where('classification_id', $id))
            ->when($request->query('supplier'), fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($request->query('status') === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->query('status') === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($request->query('low_stock') === '1', fn ($q) => $q->lowStock())
            ->orderBy('name_en')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'filters' => [
                'search' => $request->query('search'),
                'classification' => $request->query('classification'),
                'supplier' => $request->query('supplier'),
                'status' => $request->query('status'),
                'low_stock' => $request->query('low_stock'),
            ],
            'classifications' => Classification::query()->active()->orderBy('sort_order')->get(['id', 'name_en', 'name_ar']),
            'suppliers' => $user->isSupplier()
                ? Supplier::query()->whereKey($user->supplier_id)->get(['id', 'name'])
                : Supplier::query()->active()->orderBy('name')->get(['id', 'name']),
            'unitOptions' => Unit::options(),
            'canManage' => $user->isAdmin() || $user->isSupplier(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Material::class);

        $user = $request->user();

        return Inertia::render('Materials/Create', [
            'classifications' => Classification::query()->active()->orderBy('sort_order')->get(['id', 'name_en', 'name_ar']),
            'suppliers' => $user->isSupplier()
                ? Supplier::query()->whereKey($user->supplier_id)->get(['id', 'name'])
                : Supplier::query()->active()->orderBy('name')->get(['id', 'name']),
            'currencies' => \App\Models\Currency::query()->active()->get(['code', 'name', 'symbol']),
            'unitOptions' => Unit::options(),
            'isSupplierRole' => $user->isSupplier(),
        ]);
    }

    public function store(StoreMaterialRequest $request): RedirectResponse
    {
        $this->authorize('store', Material::class);

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name_en']);

        $material = Material::create($data);

        // Record the opening supplier cost history entry.
        $this->costHistory->recordChange(
            $material,
            (string) $material->default_supplier_cost,
            $material->currency_code,
            now()->toDateString(),
            $request->user()?->id,
        );

        AuditService::log('material.created', $material, null, [
            'name' => $material->name_en,
            'sku' => $material->sku,
        ]);

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'Material created successfully.');
    }

    public function show(Material $material, Request $request): Response
    {
        $this->authorize('view', $material);

        $canManageCosts = $request->user()?->role->canManageCosts() ?? false;

        // Supplier costs are sensitive — hide the cost column and history from
        // non-finance roles entirely.
        if (! $canManageCosts) {
            $material->makeHidden(['default_supplier_cost']);
        }

        return Inertia::render('Materials/Show', [
            'material' => $material->load([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
                'costRecords' => $canManageCosts
                    ? fn ($q) => $q->orderByDesc('effective_from')->limit(20)
                    : fn ($q) => $q->whereRaw('1 = 0'),
            ]),
            'currency' => $material->currency_code,
            'canManageCosts' => $canManageCosts,
        ]);
    }

    public function edit(Material $material, Request $request): Response
    {
        $this->authorize('update', $material);

        $user = $request->user();

        return Inertia::render('Materials/Edit', [
            'material' => $material->load('supplier:id,name'),
            'classifications' => Classification::query()->active()->orderBy('sort_order')->get(['id', 'name_en', 'name_ar']),
            'suppliers' => $user->isSupplier()
                ? Supplier::query()->whereKey($user->supplier_id)->get(['id', 'name'])
                : Supplier::query()->active()->orderBy('name')->get(['id', 'name']),
            'currencies' => \App\Models\Currency::query()->active()->get(['code', 'name', 'symbol']),
            'unitOptions' => Unit::options(),
            'isSupplierRole' => $user->isSupplier(),
            'canManageCosts' => $user->role->canManageCosts(),
        ]);
    }

    public function update(UpdateMaterialRequest $request, Material $material): RedirectResponse
    {
        $this->authorize('update', $material);

        $oldCost = $material->default_supplier_cost;
        $oldCurrency = $material->currency_code;

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name_en']);

        // Supplier users may never reassign materials to another supplier.
        if ($request->user()?->isSupplier()) {
            $data['supplier_id'] = $request->user()?->supplier_id;
        }

        $material->update($data);

        // Record a new cost history entry when the cost or its currency changed.
        if ((string) $oldCost !== (string) $material->default_supplier_cost
            || $oldCurrency !== $material->currency_code) {
            $this->costHistory->recordChange(
                $material,
                (string) $material->default_supplier_cost,
                $material->currency_code,
                now()->toDateString(),
                $request->user()?->id,
            );

            AuditService::log('material.cost_changed', $material, [
                'cost' => $oldCost,
                'currency' => $oldCurrency,
            ], [
                'cost' => $material->default_supplier_cost,
                'currency' => $material->currency_code,
            ]);
        }

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'Material updated successfully.');
    }

    public function destroy(Material $material): RedirectResponse
    {
        $this->authorize('delete', $material);

        if ($material->invoiceItems()->count() > 0) {
            return back()->with('error', 'This material cannot be deleted because it appears on invoices.');
        }

        $material->delete();

        return redirect()
            ->route('materials.index')
            ->with('success', 'Material archived.');
    }
}