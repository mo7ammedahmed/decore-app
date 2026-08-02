<?php

namespace App\Http\Controllers;

use App\Models\Classification;
use App\Models\GalleryImage;
use App\Models\GallerySection;
use App\Models\Material;
use App\Models\ShopSetting;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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
        'unit', 'selling_price', 'currency_code',
        'is_active', 'image_path', 'image_disk', 'image_alt_text', 'created_at', 'updated_at',
    ];

    /**
     * Public-friendly inventory stats shared by the landing and about pages.
     * One query instead of three — the app may sit behind a remote database,
     * where each round-trip costs real latency.
     *
     * @return array{materials: int, classifications: int, suppliers: int}
     */
    private function catalogStats(): array
    {
        $row = DB::table('materials')
            ->selectRaw('(SELECT COUNT(*) FROM materials WHERE is_active = 1) AS materials')
            ->selectRaw('(SELECT COUNT(*) FROM classifications WHERE is_active = 1) AS classifications')
            ->selectRaw('(SELECT COUNT(*) FROM suppliers WHERE is_active = 1) AS suppliers')
            ->first();

        return [
            'materials' => (int) ($row->materials ?? 0),
            'classifications' => (int) ($row->classifications ?? 0),
            'suppliers' => (int) ($row->suppliers ?? 0),
        ];
    }

    /**
     * Active classifications with their active-material count plus a cover
     * image. The admin-chosen collection image wins; otherwise it falls back
     * to the newest active material photo (or none). Never leaks cost data.
     *
     * @return Collection<int, Classification>
     */
    private function publicClassifications(bool $withCovers = true)
    {
        $classifications = Classification::query()
            ->active()
            ->withCount(['materials' => fn ($q) => $q->active()])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name_en', 'name_ar', 'slug', 'description', 'image_path', 'image_disk', 'image_alt_text']);

        if (! $withCovers || $classifications->isEmpty()) {
            return $classifications;
        }

        // One fallback cover per classification: the newest active material
        // that has an image, used only when the admin has not picked a cover.
        $covers = Material::query()
            ->active()
            ->whereIn('classification_id', $classifications->pluck('id'))
            ->whereNotNull('image_path')
            ->orderByDesc('updated_at')
            ->get(['id', 'classification_id', 'image_path', 'image_disk', 'image_alt_text'])
            ->groupBy('classification_id')
            ->map->first();

        return $classifications->map(function (Classification $classification) use ($covers) {
            // image_url is an appended accessor (reads image_path/image_disk), so
            // the fallback must assign the underlying columns — setAttribute on
            // an appended key would be overwritten at serialization time.
            if ($classification->image_path === null) {
                $cover = $covers->get($classification->id);

                if ($cover !== null) {
                    $classification->image_path = $cover->image_path;
                    $classification->image_disk = $cover->image_disk;
                    $classification->image_alt_text = $cover->image_alt_text ?? $classification->localized_name;
                } else {
                    $classification->image_alt_text = $classification->localized_name;
                }
            } elseif ($classification->image_alt_text === null) {
                $classification->image_alt_text = $classification->localized_name;
            }

            return $classification;
        });
    }

    /**
     * Visible portfolio images with their section name — used for the landing
     * inspiration mosaic and the about-page editorial composition.
     *
     * @return array<int, array{id: int, image_url: ?string, alt_text: ?string, section_name: string}>
     */
    private function publicPortfolio(int $limit = 12): array
    {
        return GalleryImage::query()
            ->visible()
            ->whereHas('section', fn ($q) => $q->visible())
            ->with('section:id,name_en,name_ar')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit($limit)
            ->get()
            ->map(fn (GalleryImage $image) => [
                'id' => $image->id,
                'image_url' => $image->image_url,
                'alt_text' => $image->alt_text,
                'section_name' => $image->section?->localized_name ?? '',
            ])
            ->all();
    }

    /**
     * A single hero image for the landing page: the newest visible portfolio
     * image when one exists, otherwise the newest featured material image.
     *
     * @return array{image_url: ?string, alt_text: ?string}|null
     */
    private function publicHeroImage(): ?array
    {
        $portfolio = GalleryImage::query()
            ->visible()
            ->whereHas('section', fn ($q) => $q->visible())
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->first(['id', 'path', 'disk', 'alt_text']);

        if ($portfolio !== null) {
            return [
                'image_url' => $portfolio->image_url,
                'alt_text' => $portfolio->alt_text,
            ];
        }

        $material = Material::query()
            ->active()
            ->whereNotNull('image_path')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->first(['id', 'name_en', 'name_ar', 'image_path', 'image_disk', 'image_alt_text']);

        if ($material === null) {
            return null;
        }

        return [
            'image_url' => $material->image_url,
            'alt_text' => $material->image_alt_text ?? $material->localized_name,
        ];
    }

    /**
     * Marketing landing page — the showroom front door. Image-first: hero,
     * collections with covers, featured materials and project inspiration.
     * Admins control which sections render and which finishes are featured
     * from the dashboard (Settings → Landing page).
     */
    public function landing(): Response
    {
        $settings = ShopSetting::instance();
        $sections = $settings->landingSectionFlags();
        $featuredIds = $settings->featured_material_ids ?? [];

        $featured = $sections['featured']
            ? $this->featuredMaterials($featuredIds)
            : collect();

        // Admin-picked hero / CTA images fall back to the newest published
        // image (or a material image) when unset or no longer visible.
        $hero = $this->publishedImageById($settings->hero_image_id) ?? $this->publicHeroImage();
        $cta = $this->publishedImageById($settings->cta_image_id);

        return Inertia::render('Public/Landing', [
            'stats' => $this->catalogStats(),
            'hero' => $hero,
            'cta' => $cta,
            'featured' => $featured,
            'inspiration' => $sections['inspiration'] ? $this->publicPortfolio() : [],
            'classifications' => $sections['collections'] ? $this->publicClassifications() : collect(),
            'landing_sections' => $sections,
            // Structured bilingual cards/steps — empty array means the frontend
            // renders its built-in defaults.
            'why_cards' => $settings->why_cards ?? [],
            'journey_steps' => $settings->journey_steps ?? [],
        ]);
    }

    /**
     * A single published gallery image by admin-chosen id, or null when the
     * id is unset, the image is hidden, or its section is not visible.
     *
     * @return array{image_url: ?string, alt_text: ?string}|null
     */
    private function publishedImageById(?int $imageId): ?array
    {
        if ($imageId === null) {
            return null;
        }

        $image = GalleryImage::query()
            ->visible()
            ->whereKey($imageId)
            ->whereHas('section', fn ($q) => $q->visible())
            ->first(['id', 'path', 'disk', 'alt_text']);

        if ($image === null) {
            return null;
        }

        return [
            'image_url' => $image->image_url,
            'alt_text' => $image->alt_text,
        ];
    }

    /**
     * Featured finishes for the landing page. When the admin curated specific
     * materials, those are returned in the curated order; otherwise the newest
     * active materials fill the section. Never leaks cost data.
     */
    private function featuredMaterials(array $featuredIds)
    {
        $query = Material::query()
            ->active()
            ->with([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ])
            ->select(self::PUBLIC_MATERIAL_COLUMNS);

        if ($featuredIds !== []) {
            // Fetch curated finishes, then restore the admin's order in PHP —
            // portable across SQLite (tests) and MySQL (production), and
            // inactive ids (already filtered by the active() scope) drop out.
            $byId = $query->whereIn('id', $featuredIds)->get()->keyBy('id');

            return collect($featuredIds)
                ->map(fn ($id) => $byId->get($id))
                ->filter()
                ->values();
        }

        return $query->orderByDesc('updated_at')->orderByDesc('id')->limit(6)->get();
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
                ->orderBy('id')
                ->get(['id', 'name_en', 'name_ar']),
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'classification' => $classification !== '' ? $classification : null,
            ],
        ]);
    }

    /**
     * Public material detail — finishes, pricing, supplier of record, plus
     * related finishes from the same collection.
     */
    public function show(Material $material): Response
    {
        abort_unless($material->is_active, 404);

        $material->makeHidden([
            'default_supplier_cost', 'costRecords', 'stock_quantity', 'minimum_stock_level',
        ]);

        $related = Material::query()
            ->active()
            ->where('classification_id', $material->classification_id)
            ->whereKeyNot($material->id)
            ->with([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ])
            ->select(self::PUBLIC_MATERIAL_COLUMNS)
            ->orderByDesc('updated_at')
            ->limit(4)
            ->get();

        return Inertia::render('Public/MaterialShow', [
            'material' => $material->load([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ]),
            'currency' => $material->currency_code,
            'related' => $related,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'stats' => $this->catalogStats(),
            'classifications' => $this->publicClassifications(),
            'inspiration' => $this->publicPortfolio(6),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    /**
     * Public portfolio gallery — visible sections with their visible images.
     * Guests see only published work, never drafts or hidden items.
     */
    public function gallery(): Response
    {
        $sections = GallerySection::query()
            ->visible()
            ->with(['images' => fn ($q) => $q->visible()->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Public/Gallery', [
            'sections' => $sections,
        ]);
    }
}
