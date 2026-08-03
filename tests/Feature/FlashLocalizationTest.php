<?php

namespace Tests\Feature;

use App\Models\Classification;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks the flash-message contract: every dashboard controller must flash a
 * translation key (e.g. 'material.created'), never a raw English sentence.
 * FlashMessage.tsx translates keys through t() and falls back to the literal
 * for unknown values, so a raw string here means the toast stays English in
 * Arabic mode — exactly the regression this suite guards against.
 */
class FlashLocalizationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private InvoiceService $invoices;

    private PaymentService $payments;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->admin = User::factory()->admin()->create();
        $this->invoices = app(InvoiceService::class);
        $this->payments = app(PaymentService::class);
    }

    private function material(): Material
    {
        return Material::factory()->create(['currency_code' => 'SAR']);
    }

    private function issuedInvoice(): Invoice
    {
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);
        $invoice = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'currency_code' => 'SAR',
            'discount_type' => 'none',
            'discount_value' => 0,
        ], [['material_id' => $this->material()->id, 'quantity' => 1, 'tax_rate' => 15]], $this->admin);

        $this->invoices->issue($invoice, $this->admin);

        return $invoice;
    }

    public function test_user_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('users.store'), [
                'name' => 'New Staff',
                'email' => 'staff@decore.test',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'sales_staff',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'user.created');
    }

    public function test_material_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('materials.store'), [
                'supplier_id' => Supplier::factory()->create()->id,
                'classification_id' => Classification::factory()->create()->id,
                'name_en' => 'Walnut Veneer',
                'sku' => 'MAT-TEST-1',
                'unit' => 'sheet',
                'selling_price' => 120,
                'default_supplier_cost' => 60,
                'currency_code' => 'SAR',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'material.created');
    }

    public function test_material_delete_blocked_flash_uses_translation_key(): void
    {
        $material = $this->material();
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);
        $invoice = Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $this->admin->id,
        ]);
        $invoice->items()->create([
            'material_id' => $material->id,
            'description' => $material->name_en,
            'quantity' => 1,
            'unit' => 'piece',
            'unit_price' => 100,
            'unit_cost' => 40,
            'line_subtotal' => 100,
            'line_total' => 115,
        ]);

        $this->actingAs($this->admin)
            ->delete(route('materials.destroy', $material))
            ->assertRedirect()
            ->assertSessionHas('error', 'material.delete_on_invoices');
    }

    public function test_customer_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('customers.store'), ['name' => 'Ahmed Hassan'])
            ->assertRedirect()
            ->assertSessionHas('success', 'customer.created');
    }

    public function test_customer_delete_blocked_flash_uses_translation_key(): void
    {
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);
        Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->delete(route('customers.destroy', $customer))
            ->assertRedirect()
            ->assertSessionHas('error', 'customer.delete_has_invoices');
    }

    public function test_supplier_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('suppliers.store'), ['name' => 'Al Noor Supplies'])
            ->assertRedirect()
            ->assertSessionHas('success', 'supplier.created');
    }

    public function test_supplier_delete_blocked_flash_uses_translation_key(): void
    {
        $supplier = Supplier::factory()->create();
        Material::factory()->create(['supplier_id' => $supplier->id]);

        $this->actingAs($this->admin)
            ->delete(route('suppliers.destroy', $supplier))
            ->assertRedirect()
            ->assertSessionHas('error', 'supplier.delete_has_materials');
    }

    public function test_classification_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('classifications.store'), ['name_en' => 'Wall Panels'])
            ->assertRedirect()
            ->assertSessionHas('success', 'classification.created');
    }

    public function test_classification_delete_blocked_flash_uses_translation_key(): void
    {
        $classification = Classification::factory()->create();
        Material::factory()->create(['classification_id' => $classification->id]);

        $this->actingAs($this->admin)
            ->delete(route('classifications.destroy', $classification))
            ->assertRedirect()
            ->assertSessionHas('error', 'classification.delete_has_materials');
    }

    public function test_currency_and_exchange_rate_flashes_use_translation_keys(): void
    {
        $this->actingAs($this->admin)
            ->post(route('currencies.store'), [
                'code' => 'KWD',
                'name' => 'Kuwaiti Dinar',
                'symbol' => 'د.ك',
                'decimal_places' => 3,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'currency.created');

        $this->actingAs($this->admin)
            ->post(route('exchange-rates.store'), [
                'base_currency_code' => 'SAR',
                'quote_currency_code' => 'USD',
                'rate' => '3.75',
                'effective_date' => now()->toDateString(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'exchange_rate.saved');
    }

    public function test_gallery_section_flash_uses_translation_key(): void
    {
        $this->actingAs($this->admin)
            ->post(route('gallery.store'), ['name_en' => 'Luxury Residences'])
            ->assertRedirect()
            ->assertSessionHas('success', 'gallery.section_created');
    }

    public function test_shop_settings_flash_uses_translation_key(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('settings.update'), [
                'shop_name' => 'Decore',
                'invoice_template' => 'classic',
                'invoice_accent' => '#8a6d3b',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'settings.saved');
    }

    public function test_profile_settings_flash_uses_translation_key(): void
    {
        $hex = ['#0f172a', '#1e293b', '#334155', '#f8fafc', '#94a3b8'];

        $payload = ['shop_name' => 'Decore'];
        foreach (['theme_dark', 'theme_light'] as $group) {
            $i = 0;
            foreach (['accent', 'background', 'surface', 'foreground', 'muted'] as $part) {
                $payload["{$group}_{$part}"] = $hex[$i++];
            }
        }

        $this->actingAs($this->admin)
            ->patch(route('settings.profile.update'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect()
            ->assertSessionHas('success', 'profile_settings.saved');
    }

    public function test_site_content_flash_uses_translation_key(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('site-content.update'), [
                'content' => ['landing.hero_line1' => ['en' => 'Materials that', 'ar' => 'مواد تحوّل']],
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect()
            ->assertSessionHas('success', 'site_content.saved');
    }

    public function test_invoice_success_flashes_use_translation_keys(): void
    {
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);

        $this->actingAs($this->admin)
            ->post(route('invoices.store'), [
                'customer_id' => $customer->id,
                'issue_date' => now()->toDateString(),
                'currency_code' => 'SAR',
                'discount_type' => 'none',
                'discount_value' => 0,
                'items' => [['material_id' => $this->material()->id, 'quantity' => 1, 'tax_rate' => 15]],
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'invoice.draft_created');

        $invoice = Invoice::query()->latest('id')->first();

        $this->actingAs($this->admin)
            ->post(route('invoices.issue', $invoice))
            ->assertRedirect()
            ->assertSessionHas('success', 'invoice.issued');
    }

    public function test_invoice_state_errors_are_blocked_by_policy(): void
    {
        // InvoicePolicy gates state transitions (issue requires draft, cancel
        // requires draft/issued), so these requests never reach the controller's
        // DomainException flash path — they must be rejected with 403, never
        // leaking a raw English message into a toast.
        $issued = $this->issuedInvoice();

        $this->actingAs($this->admin)
            ->post(route('invoices.issue', $issued))
            ->assertForbidden();

        $this->invoices->complete($issued, $this->admin);

        $this->actingAs($this->admin)
            ->post(route('invoices.cancel', $issued))
            ->assertForbidden();
    }

    public function test_payment_flashes_and_domain_errors_use_translation_keys(): void
    {
        $invoice = $this->issuedInvoice();

        $this->actingAs($this->admin)
            ->post(route('payments.store', $invoice), [
                'amount' => 100,
                'payment_method' => 'cash',
                'paid_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'payment.recorded');

        $payment = $invoice->payments()->first();

        $this->actingAs($this->admin)
            ->post(route('payments.reverse', $payment))
            ->assertRedirect()
            ->assertSessionHas('success', 'payment.reversed');

        // Reversing an already-reversed payment is blocked by PaymentPolicy.
        $this->actingAs($this->admin)
            ->post(route('payments.reverse', $payment))
            ->assertForbidden();

        // Payments against draft invoices are rejected with a localized key
        // (PaymentPolicy does not gate on invoice status, so the service's
        // DomainException path is what surfaces).
        $draftCustomer = Customer::factory()->create(['created_by' => $this->admin->id]);
        $draft = $this->invoices->create([
            'customer_id' => $draftCustomer->id,
            'issue_date' => now()->toDateString(),
            'currency_code' => 'SAR',
            'discount_type' => 'none',
            'discount_value' => 0,
        ], [['material_id' => $this->material()->id, 'quantity' => 1, 'tax_rate' => 15]], $this->admin);

        $this->actingAs($this->admin)
            ->post(route('payments.store', $draft), [
                'amount' => 50,
                'payment_method' => 'cash',
                'paid_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'payment.error_invalid_status');

        // Payments against cancelled invoices are rejected with a localized key.
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);
        $cancelled = $this->invoices->create([
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'currency_code' => 'SAR',
            'discount_type' => 'none',
            'discount_value' => 0,
        ], [['material_id' => $this->material()->id, 'quantity' => 1, 'tax_rate' => 15]], $this->admin);
        $this->invoices->cancel($cancelled, $this->admin);

        $this->actingAs($this->admin)
            ->post(route('payments.store', $cancelled), [
                'amount' => 50,
                'payment_method' => 'cash',
                'paid_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'payment.error_cancelled_invoice');
    }
}
