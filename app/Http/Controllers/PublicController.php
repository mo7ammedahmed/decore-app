<?php

namespace App\Http\Controllers;

use App\Models\Classification;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Columns safe for the public catalog. Supplier cost is a trade secret —
     * it must never leave the server on a guest-facing page.
     */
    private const PUBLIC_MATERIAL_COLUMNS = [
        'id', 'supplier_id', 'classification_id', 'name_en', 'name_ar', 'slug', 'sku', 'description',
        'unit', 'selling_price', 'currency_code', 'stock_quantity', 'minimum_stock_level',
        'is_active', 'image_path', 'image_disk', 'image_alt_text', 'created_at', 'updated_at',
    ];

    /**
     * Public-friendly inventory stats shared by the landing and about pages.
     *
     * @return array{materials: int, classifications: int, suppliers: int}
     */
    private function catalogStats(): array
    {
        return [
            'materials' => Material::query()->active()->count(),
            'classifications' => Classification::query()->active()->count(),
            'suppliers' => Supplier::query()->active()->count(),
        ];
    }

    /**
     * Marketing landing page — the atelier front door.
     */
    public function landing(): Response
    {
        $featured = Material::query()
            ->active()
            ->with([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ])
            ->select(self::PUBLIC_MATERIAL_COLUMNS)
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get();

        return Inertia::render('Public/Landing', [
            'stats' => $this->catalogStats(),
            'featured' => $featured,
            'classifications' => Classification::query()
                ->active()
                ->withCount(['materials' => fn ($q) => $q->active()])
                ->orderBy('sort_order')
                ->get(['id', 'name_en', 'name_ar', 'slug', 'description']),
        ]);
    }

    /**
     * Public catalog — active materials only, search + classification filters.
     */
    public function catalog(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $classification = $request->string('classification')->toString();

        $materials = Material::query()
            ->active()
            ->with([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ])
            ->select(self::PUBLIC_MATERIAL_COLUMNS)
            ->when($search !== '', fn ($q) => $q
                ->where(fn ($inner) => $inner
                    ->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")))
            ->when($classification !== '', fn ($q) => $q->where('classification_id', $classification))
            ->orderBy('name_en')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Public/Catalog', [
            'materials' => $materials,
            'classifications' => Classification::query()
                ->active()
                ->orderBy('sort_order')
                ->get(['id', 'name_en', 'name_ar']),
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'classification' => $classification !== '' ? $classification : null,
            ],
        ]);
    }

    /**
     * Public material detail — finishes, pricing, supplier of record.
     */
    public function show(Material $material): Response
    {
        abort_unless($material->is_active, 404);

        $material->makeHidden(['default_supplier_cost', 'costRecords']);

        return Inertia::render('Public/MaterialShow', [
            'material' => $material->load([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ]),
            'currency' => $material->currency_code,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'stats' => $this->catalogStats(),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }
}
