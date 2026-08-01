<?php

namespace Tests\Feature;

use App\Models\Classification;
use App\Models\Material;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocalizedNamesTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_serves_arabic_names_when_locale_is_arabic(): void
    {
        Classification::factory()->create([
            'name_en' => 'Wood Alternatives',
            'name_ar' => 'بدائل الخشب',
        ]);

        $response = $this->withCookie('locale', 'ar')->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Landing')
            ->where('locale', 'ar')
            ->where('classifications.0.localized_name', 'بدائل الخشب')
            ->where('classifications.0.name_en', 'Wood Alternatives'));
    }

    public function test_catalog_serves_arabic_names_when_locale_is_arabic(): void
    {
        $classification = Classification::factory()->create([
            'name_en' => 'Flooring',
            'name_ar' => 'الأرضيات',
        ]);

        $supplier = Supplier::factory()->create();

        Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Travertine Flooring Tile',
            'name_ar' => 'بلاط ترافرتين للأرضيات',
        ]);

        $response = $this->withCookie('locale', 'ar')->get('/catalog');

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Catalog')
            ->where('materials.data.0.localized_name', 'بلاط ترافرتين للأرضيات')
            ->where('classifications.0.localized_name', 'الأرضيات'));
    }

    public function test_english_locale_falls_back_to_canonical_names(): void
    {
        Classification::factory()->create([
            'name_en' => 'Wall Panels',
            'name_ar' => 'ألواح الجدران',
        ]);

        $response = $this->withCookie('locale', 'en')->get('/');

        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Landing')
            ->where('locale', 'en')
            ->where('classifications.0.localized_name', 'Wall Panels'));
    }

    public function test_material_without_arabic_name_falls_back_to_canonical_name(): void
    {
        $classification = Classification::factory()->create();
        $supplier = Supplier::factory()->create();

        Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Plain Material',
            'name_ar' => null,
        ]);

        $response = $this->withCookie('locale', 'ar')->get('/catalog');

        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Catalog')
            ->where('materials.data.0.localized_name', 'Plain Material'));
    }

    public function test_arabic_search_matches_arabic_material_names(): void
    {
        $classification = Classification::factory()->create();
        $supplier = Supplier::factory()->create();

        Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Brushed Oak Profile',
            'name_ar' => 'بروفيل بلوط مصقول',
        ]);

        $response = $this->withCookie('locale', 'ar')->get('/catalog?search='.urlencode('بلوط'));

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Catalog')
            ->where('materials.total', 1)
            ->where('materials.data.0.name_en', 'Brushed Oak Profile'));
    }

    public function test_dashboard_top_selling_uses_localized_names(): void
    {
        $this->seed(\Database\Seeders\TaxRateSeeder::class);

        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $classification = Classification::factory()->create([
            'name_en' => 'Wood Alternatives',
            'name_ar' => 'بدائل الخشب',
        ]);
        $supplier = Supplier::factory()->create();
        $customer = \App\Models\Customer::factory()->create();
        $material = Material::factory()->create([
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'name_en' => 'Walnut Veneer Panel',
            'name_ar' => 'لوح قشرة الجوز',
            'selling_price' => 100,
        ]);

        \App\Models\Invoice::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
            'status' => \App\Enums\InvoiceStatus::Completed,
            'issue_date' => now()->toDateString(),
        ])->items()->create([
            'material_id' => $material->id,
            'supplier_id' => $supplier->id,
            'classification_id' => $classification->id,
            'description' => 'Walnut Veneer Panel',
            'quantity' => 2,
            'unit' => 'sheet',
            'unit_price' => 100,
            'unit_cost' => 50,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'line_subtotal' => 200,
            'line_total' => 200,
        ]);

        $response = $this->actingAs($admin)
            ->withCookie('locale', 'ar')
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($assert) => $assert
            ->component('Dashboard')
            ->where('metrics.top_selling.0.name', 'لوح قشرة الجوز'));
    }
}
