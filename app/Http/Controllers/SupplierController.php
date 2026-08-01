<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Supplier::class);

        $user = $request->user();

        $suppliers = Supplier::query()
            ->when($user->isSupplier(), fn ($q) => $q->whereKey($user->supplier_id))
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")))
            ->withCount(['materials', 'users'])
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => ['search' => $request->query('search')],
            'canManage' => $user->isAdmin(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Supplier::class);

        return Inertia::render('Suppliers/Create');
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->authorize('store', Supplier::class);

        $supplier = Supplier::create($request->validated());

        return redirect()
            ->route('suppliers.show', $supplier)
            ->with('success', 'Supplier created successfully.');
    }

    public function show(Supplier $supplier, Request $request): Response
    {
        $this->authorize('view', $supplier);

        $canManageCosts = $request->user()?->role->canManageCosts() ?? false;

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier->load([
                // Supplier costs are sensitive — non-finance roles only get
                // the catalogue columns.
                'materials' => fn ($q) => $q
                    ->when(! $canManageCosts, fn ($inner) => $inner->select([
                        'id', 'name_en', 'name_ar', 'sku', 'selling_price', 'currency_code', 'is_active',
                        'image_path', 'image_disk',
                    ]))
                    ->orderBy('name_en')
                    ->limit(20),
                'users' => fn ($q) => $q->select('id', 'name', 'email', 'is_active'),
            ]),
            'materialsCount' => $supplier->materials()->count(),
            'canManage' => $request->user()->can('update', $supplier),
        ]);
    }

    public function edit(Supplier $supplier): Response
    {
        $this->authorize('update', $supplier);

        return Inertia::render('Suppliers/Edit', ['supplier' => $supplier]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        $supplier->update($request->validated());

        return redirect()
            ->route('suppliers.show', $supplier)
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        if (Material::query()->where('supplier_id', $supplier->id)->exists()) {
            return back()->with('error', 'This supplier cannot be deleted because it still has materials. Archive it instead.');
        }

        $supplier->delete();

        return redirect()
            ->route('suppliers.index')
            ->with('success', 'Supplier archived.');
    }
}
