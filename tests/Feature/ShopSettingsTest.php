<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Material;
use App\Models\ShopSetting;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShopSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'shop_name' => 'Decore',
            'tagline' => 'Decoration materials atelier',
            'country_code' => 'SA',
            'invoice_template' => 'classic',
            'invoice_accent' => '#8a6d3b',
            'invoice_thank_you' => 'Thank you for your business',
        ], $overrides);
    }

    public function test_admin_can_view_settings_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/settings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Index')
                ->has('settings.shop_name')
                ->has('settings.invoice_template'));
    }

    public function test_admin_can_update_shop_details_and_template(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload([
                'shop_name' => 'Atelier Al Noor',
                'tagline' => 'Curated finishes',
                'tax_number' => '310123456700003',
                'invoice_template' => 'modern',
                'invoice_accent' => '#0f766e',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertSame('Atelier Al Noor', $settings->shop_name);
        $this->assertSame('Curated finishes', $settings->tagline);
        $this->assertSame('310123456700003', $settings->tax_number);
        $this->assertSame('modern', $settings->invoice_template);
        $this->assertSame('#0f766e', $settings->invoice_accent);
    }

    public function test_invalid_template_and_missing_name_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload(['shop_name' => '', 'invoice_template' => 'fancy']))
            ->assertSessionHasErrors(['shop_name', 'invoice_template']);
    }

    public function test_non_admin_cannot_access_settings(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)->get('/settings')->assertForbidden();
        $this->actingAs($sales)->patch('/settings', $this->validPayload())->assertForbidden();
    }

    public function test_logo_upload_stores_and_replaces_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload([
                'logo' => UploadedFile::fake()->create('logo.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertNotNull($settings->logo_path);
        Storage::disk('public')->assertExists($settings->logo_path);

        $oldPath = $settings->logo_path;

        // Replacing deletes the previous stored file.
        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload([
                'logo' => UploadedFile::fake()->create('logo2.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $fresh = ShopSetting::instance();
        $this->assertNotNull($fresh->logo_path);
        $this->assertNotSame($oldPath, $fresh->logo_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($fresh->logo_path);
    }

    public function test_non_image_logo_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload([
                'logo' => UploadedFile::fake()->create('logo.txt', 10, 'text/plain'),
            ]))
            ->assertSessionHasErrors('logo');

        $this->assertNull(ShopSetting::instance()->logo_path);
    }

    public function test_remove_logo_clears_stored_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload([
                'logo' => UploadedFile::fake()->create('logo.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $oldPath = ShopSetting::instance()->logo_path;

        $this->actingAs($admin)
            ->patch('/settings', $this->validPayload(['remove_logo' => true]))
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertNull($settings->logo_path);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_shop_brand_is_shared_on_public_pages(): void
    {
        ShopSetting::query()->updateOrCreate(['id' => 1], [
            'shop_name' => 'Test Atelier',
            'tagline' => 'Live tagline',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Landing')
                ->where('shop.shop_name', 'Test Atelier')
                ->where('shop.tagline', 'Live tagline'));
    }

    public function test_print_page_receives_settings(): void
    {
        $admin = User::factory()->admin()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);
        $customer = Customer::factory()->create(['created_by' => $admin->id]);

        $invoice = app(InvoiceService::class)->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-08-01',
            'currency_code' => 'SAR',
            'discount_type' => 'none',
            'discount_value' => 0,
        ], [['material_id' => $material->id, 'quantity' => 1, 'tax_rate' => 15]], $admin);

        $this->actingAs($admin)
            ->get("/invoices/{$invoice->id}/print")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invoices/Print')
                ->has('settings.name')
                ->where('settings.template', 'classic')
                ->where('settings.accent', '#8a6d3b')
                ->where('settings.footer_note', null)
                ->where('settings.thank_you', 'Thank you for your business'));
    }

    public function test_settings_permission_flag_tracks_role(): void
    {
        $this->actingAs(User::factory()->salesStaff()->create())
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('permissions.settings', false));

        $this->actingAs(User::factory()->admin()->create())
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('permissions.settings', true));
    }
}
