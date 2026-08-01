<?php

namespace Tests\Feature;

use App\Models\Classification;
use App\Models\GalleryImage;
use App\Models\GallerySection;
use App\Models\Material;
use App\Models\ShopSetting;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicSiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        config(['filesystems.default' => 'public']);
    }

    private function material(array $overrides = []): Material
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create();

        return Material::factory()->create(array_merge([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
        ], $overrides));
    }

    private function publishGalleryImage(): GalleryImage
    {
        $section = GallerySection::factory()->create([
            'name_en' => 'Lobby',
            'name_ar' => 'البهو',
            'is_visible' => true,
        ]);

        $this->actingAs(\App\Models\User::factory()->admin()->create())
            ->post("/gallery-admin/{$section->id}/images", [
                'image' => UploadedFile::fake()->image('lobby.png', 1200, 800),
                'alt_text' => 'Marble lobby installation',
            ]);

        return $section->images()->first();
    }

    public function test_guest_routes_return_success(): void
    {
        foreach (['/', '/catalog', '/about', '/contact', '/gallery'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_landing_props_are_public_safe(): void
    {
        $this->material(['name_en' => 'Walnut Panel', 'selling_price' => 120]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->has('featured', 1)
            ->where('featured.0.name_en', 'Walnut Panel')
            ->where('featured.0.selling_price', '120.00')
            ->missing('featured.0.default_supplier_cost')
            ->missing('featured.0.costRecords')
            ->where('stats.materials', 1));
    }

    public function test_landing_uses_gallery_image_as_hero_and_inspiration(): void
    {
        $image = $this->publishGalleryImage();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('hero.image_url', $image->image_url)
            ->where('inspiration.0.id', $image->id));
    }

    public function test_landing_hidden_gallery_content_is_excluded(): void
    {
        $this->publishGalleryImage();

        GalleryImage::query()->update(['is_visible' => false]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('hero', null)
            ->where('inspiration', []));
    }

    public function test_inactive_materials_do_not_appear_publicly(): void
    {
        $this->material(['name_en' => 'Visible Finish']);
        $this->material(['name_en' => 'Hidden Finish', 'is_active' => false]);

        $this->get('/catalog')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('materials.total', 1)
            ->where('materials.data.0.name_en', 'Visible Finish'));
    }

    public function test_catalog_search_still_works(): void
    {
        $this->material(['name_en' => 'Brushed Oak Profile', 'sku' => 'MAT-OAK']);
        $this->material(['name_en' => 'Carrara Marble Sheet', 'sku' => 'MAT-MAR']);

        $this->get('/catalog?search=oak')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('materials.total', 1)
            ->where('materials.data.0.sku', 'MAT-OAK'));
    }

    public function test_classification_filter_works(): void
    {
        $supplier = Supplier::factory()->create();
        $wood = Classification::factory()->create(['name_en' => 'Wood']);
        $marble = Classification::factory()->create(['name_en' => 'Marble']);

        Material::factory()->create(['supplier_id' => $supplier->id, 'classification_id' => $wood->id, 'name_en' => 'Oak']);
        Material::factory()->create(['supplier_id' => $supplier->id, 'classification_id' => $marble->id, 'name_en' => 'Travertine']);

        $this->get('/catalog?classification='.$wood->id)->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('materials.total', 1)
            ->where('materials.data.0.name_en', 'Oak'));
    }

    public function test_catalog_pagination_works(): void
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create();

        for ($i = 0; $i < 14; $i++) {
            Material::factory()->create([
                'supplier_id' => $supplier->id,
                'classification_id' => $classification->id,
                'name_en' => "Finish {$i}",
            ]);
        }

        $this->get('/catalog')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('materials.total', 14)
            ->where('materials.per_page', 12)
            ->has('materials.data', 12)
            ->where('materials.last_page', 2));

        $this->get('/catalog?page=2')->assertInertia(fn (Assert $page) => $page
            ->has('materials.data', 2)
            ->where('materials.data.0.name_en', 'Finish 8'));
    }

    public function test_material_show_includes_related_finishes_and_hides_costs(): void
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create();

        $main = Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Main Finish',
            'default_supplier_cost' => 10,
        ]);
        Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Related Finish',
        ]);
        // A finish from another collection must not appear in related.
        Material::factory()->create(['name_en' => 'Unrelated Finish']);

        $this->get("/catalog/{$main->slug}")->assertInertia(fn (Assert $page) => $page
            ->component('Public/MaterialShow')
            ->where('material.name_en', 'Main Finish')
            ->missing('material.default_supplier_cost')
            ->has('related', 1)
            ->where('related.0.name_en', 'Related Finish'));
    }

    public function test_material_detail_returns_404_for_inactive_material(): void
    {
        $inactive = $this->material(['name_en' => 'Archived', 'is_active' => false]);

        $this->get("/catalog/{$inactive->slug}")->assertNotFound();
    }

    public function test_arabic_locale_still_works_across_public_pages(): void
    {
        $this->withCookie('locale', 'ar')->get('/')->assertOk();
        $this->withCookie('locale', 'ar')->get('/catalog')->assertOk();
        $this->withCookie('locale', 'ar')->get('/gallery')->assertOk();
    }

    public function test_landing_respects_hidden_sections_from_dashboard(): void
    {
        $this->material(['name_en' => 'Featured Finish']);
        $this->publishGalleryImage();

        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'landing_sections' => ['featured' => false, 'inspiration' => false],
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('landing_sections.featured', false)
            ->where('landing_sections.inspiration', false)
            ->where('featured', [])
            ->where('inspiration', [])
            ->where('landing_sections.collections', true));
    }

    public function test_landing_hides_sections_when_multipart_submits_string_false(): void
    {
        // The settings form is multipart (it uploads the logo), so an
        // unchecked checkbox arrives as the string "0", not boolean false.
        // Stored string values must hide the section on the public page.
        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'landing_sections' => ['why' => '0', 'journey' => '0'],
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('landing_sections.why', false)
            ->where('landing_sections.journey', false)
            ->where('landing_sections.collections', true)
            ->where('landing_sections.cta', true));
    }

    public function test_landing_uses_curated_featured_materials_in_order(): void
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create();

        $a = Material::factory()->create(['supplier_id' => $supplier->id, 'classification_id' => $classification->id, 'name_en' => 'Alpha']);
        $b = Material::factory()->create(['supplier_id' => $supplier->id, 'classification_id' => $classification->id, 'name_en' => 'Bravo']);
        $c = Material::factory()->create(['supplier_id' => $supplier->id, 'classification_id' => $classification->id, 'name_en' => 'Charlie']);

        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'featured_material_ids' => [$c->id, $a->id],
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->has('featured', 2)
            ->where('featured.0.name_en', 'Charlie')
            ->where('featured.1.name_en', 'Alpha'));
    }

    public function test_settings_update_accepts_landing_controls(): void
    {
        $admin = User::factory()->admin()->create();
        $material = $this->material(['name_en' => 'Curated Finish']);

        $this->actingAs($admin)->patch('/settings', [
            'shop_name' => 'Decore',
            'invoice_template' => 'classic',
            'invoice_accent' => '#8a6d3b',
            'landing_sections' => ['featured' => false, 'cta' => false],
            'featured_material_ids' => [$material->id],
        ])->assertSessionHasNoErrors();

        $settings = ShopSetting::instance();

        $this->assertSame(['featured' => false, 'cta' => false], $settings->landing_sections);
        $this->assertSame([$material->id], $settings->featured_material_ids);
    }

    public function test_settings_update_normalises_multipart_string_values(): void
    {
        // Multipart submissions carry booleans and ids as strings; the request
        // must normalise them so the stored JSON holds real booleans/ints.
        $admin = User::factory()->admin()->create();
        $material = $this->material(['name_en' => 'Curated Finish']);

        $this->actingAs($admin)->patch('/settings', [
            'shop_name' => 'Decore',
            'invoice_template' => 'classic',
            'invoice_accent' => '#8a6d3b',
            'landing_sections' => ['why' => '0', 'cta' => '1'],
            'featured_material_ids' => [(string) $material->id],
        ])->assertSessionHasNoErrors();

        $settings = ShopSetting::instance();

        $this->assertSame(['why' => false, 'cta' => true], $settings->landing_sections);
        $this->assertSame([$material->id], $settings->featured_material_ids);
    }

    public function test_landing_uses_admin_picked_hero_and_cta_images(): void
    {
        $hero = $this->publishGalleryImage();
        GalleryImage::query()->whereKeyNot($hero->id)->delete();
        $cta = $this->publishGalleryImage();

        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'hero_image_id' => $hero->id,
            'cta_image_id' => $cta->id,
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('hero.image_url', $hero->image_url)
            ->where('cta.image_url', $cta->image_url));
    }

    public function test_landing_falls_back_when_picked_image_is_hidden(): void
    {
        $picked = $this->publishGalleryImage();
        $newest = $this->publishGalleryImage();

        GalleryImage::query()->whereKey($picked->id)->update(['is_visible' => false]);

        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'hero_image_id' => $picked->id,
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('hero.image_url', $newest->image_url));
    }

    public function test_settings_update_rejects_invalid_hero_image_id(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->patch('/settings', [
            'shop_name' => 'Decore',
            'invoice_template' => 'classic',
            'invoice_accent' => '#8a6d3b',
            'hero_image_id' => 999999,
        ])->assertSessionHasErrors('hero_image_id');
    }

    public function test_landing_collections_use_admin_chosen_cover_over_material_photo(): void
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create(['name_en' => 'Wood Alternatives']);

        // A material photo exists, but the admin-picked cover must win.
        Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Oak Panel',
            'image_path' => 'materials/1/oak.png',
            'image_disk' => 'public',
        ]);

        $classification->forceFill([
            'image_path' => 'classifications/1/cover.png',
            'image_disk' => 'public',
            'image_alt_text' => 'Wood alternatives collection',
        ])->save();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('classifications.0.name_en', 'Wood Alternatives')
            ->where('classifications.0.image_url', $classification->image_url)
            ->where('classifications.0.image_alt_text', 'Wood alternatives collection'));
    }

    public function test_landing_collections_fall_back_to_material_photo_without_cover(): void
    {
        $supplier = Supplier::factory()->create();
        $classification = Classification::factory()->create(['name_en' => 'Flooring']);

        $material = Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Travertine Tile',
            'image_path' => 'materials/1/travertine.png',
            'image_disk' => 'public',
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('classifications.0.name_en', 'Flooring')
            ->where('classifications.0.image_url', $material->image_url));
    }

    public function test_about_page_uses_admin_chosen_classification_cover(): void
    {
        $classification = Classification::factory()->create(['name_en' => 'Wall Panels']);

        $classification->forceFill([
            'image_path' => 'classifications/1/wall.png',
            'image_disk' => 'public',
        ])->save();

        $this->get('/about')->assertInertia(fn (Assert $page) => $page
            ->component('Public/About')
            ->where('classifications.0.image_url', $classification->image_url));
    }

    public function test_landing_sends_structured_why_cards_and_journey_steps(): void
    {
        ShopSetting::query()->create([
            'shop_name' => 'Decore',
            'why_cards' => [
                ['title_en' => 'Curated', 'title_ar' => 'منتقاة', 'body_en' => 'Body one', 'body_ar' => 'المحتوى الأول'],
                ['title_en' => 'Trusted', 'title_ar' => null, 'body_en' => 'Body two', 'body_ar' => null],
            ],
            'journey_steps' => [
                ['title_en' => 'Discover', 'title_ar' => 'اكتشف', 'body_en' => 'Browse', 'body_ar' => 'تصفح'],
            ],
        ]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('why_cards.0.title_en', 'Curated')
            ->where('why_cards.0.title_ar', 'منتقاة')
            ->where('why_cards.1.title_ar', null)
            ->has('why_cards', 2)
            ->where('journey_steps.0.title_en', 'Discover')
            ->has('journey_steps', 1));
    }

    public function test_landing_defaults_to_empty_structured_content_when_unset(): void
    {
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Public/Landing')
            ->where('why_cards', [])
            ->where('journey_steps', []));
    }
}


