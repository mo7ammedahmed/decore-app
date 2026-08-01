<?php

namespace Tests\Feature;

use App\Enums\DiscountType;
use App\Enums\UserRole;
use App\Models\Classification;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
    }

    public function test_supplier_cannot_view_another_suppliers_material(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();
        $materialB = Material::factory()->create(['supplier_id' => $supplierB->id]);

        $user = User::factory()->supplier($supplierA)->create();

        $this->actingAs($user)
            ->get("/materials/{$materialB->id}")
            ->assertForbidden();
    }

    public function test_supplier_can_view_their_own_material(): void
    {
        $supplierA = Supplier::factory()->create();
        $material = Material::factory()->create(['supplier_id' => $supplierA->id]);

        $user = User::factory()->supplier($supplierA)->create();

        $this->actingAs($user)
            ->get("/materials/{$material->id}")
            ->assertOk();
    }

    public function test_supplier_cannot_reassign_a_material_to_another_supplier(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();
        $classification = Classification::factory()->create();
        $material = Material::factory()->create([
            'supplier_id' => $supplierA->id,
            'classification_id' => $classification->id,
        ]);

        $user = User::factory()->supplier($supplierA)->create();

        $this->actingAs($user)
            ->patch("/materials/{$material->id}", [
                'supplier_id' => $supplierB->id,
                'classification_id' => $classification->id,
                'name_en' => $material->name_en,
                'sku' => $material->sku,
                'unit' => $material->unit->value,
                'selling_price' => $material->selling_price,
                'default_supplier_cost' => $material->default_supplier_cost,
                'currency_code' => 'SAR',
            ])
            ->assertSessionHasErrors('supplier_id');

        $this->assertSame($supplierA->id, $material->fresh()->supplier_id);
    }

    public function test_non_admin_cannot_change_user_roles(): void
    {
        $target = User::factory()->salesStaff()->create();
        $accountant = User::factory()->accountant()->create();

        $this->actingAs($accountant)
            ->patch("/users/{$target->id}", [
                'name' => $target->name,
                'email' => $target->email,
                'role' => UserRole::Admin->value,
            ])
            ->assertForbidden();

        $this->assertSame(UserRole::SalesStaff, $target->fresh()->role);
    }

    public function test_inactive_user_is_blocked_from_protected_areas(): void
    {
        $inactive = User::factory()->inactive()->create();

        $this->actingAs($inactive)
            ->get('/dashboard')
            ->assertForbidden();
    }

    public function test_sales_staff_cannot_create_materials(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)
            ->post('/materials', [
                'supplier_id' => Supplier::factory()->create()->id,
                'classification_id' => Classification::factory()->create()->id,
                'name_en' => 'Test Panel',
                'sku' => 'SKU-X1',
                'unit' => 'piece',
                'selling_price' => 100,
                'default_supplier_cost' => 50,
                'currency_code' => 'SAR',
            ])
            ->assertForbidden();
    }

    public function test_supplier_cannot_access_customers_or_invoices(): void
    {
        $supplier = Supplier::factory()->create();
        $user = User::factory()->supplier($supplier)->create();

        $this->actingAs($user)->get('/customers')->assertForbidden();
        $this->actingAs($user)->get('/invoices')->assertForbidden();
    }

    public function test_sales_staff_invoice_payload_hides_cost_snapshots(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create([
            'selling_price' => 100.00,
            'default_supplier_cost' => 40.00,
            'currency_code' => 'SAR',
        ]);
        $customer = Customer::factory()->create(['created_by' => $sales->id]);

        $invoice = app(InvoiceService::class)->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $sales);

        $this->actingAs($sales)
            ->get("/invoices/{$invoice->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invoices/Show')
                ->missing('invoice.items.0.unit_cost')
                ->missing('invoice.items.0.base_unit_cost'));
    }

    public function test_accountant_invoice_payload_includes_cost_snapshots(): void
    {
        $accountant = User::factory()->accountant()->create();
        $material = Material::factory()->create([
            'selling_price' => 100.00,
            'default_supplier_cost' => 40.00,
            'currency_code' => 'SAR',
        ]);
        $customer = Customer::factory()->create(['created_by' => $accountant->id]);

        $invoice = app(InvoiceService::class)->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $accountant);

        $this->actingAs($accountant)
            ->get("/invoices/{$invoice->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invoices/Show')
                ->has('invoice.items.0.unit_cost'));
    }

    public function test_sales_staff_cannot_view_other_staff_invoices(): void
    {
        $owner = User::factory()->salesStaff()->create();
        $other = User::factory()->salesStaff()->create();
        $material = Material::factory()->create([
            'selling_price' => 100.00,
            'currency_code' => 'SAR',
        ]);
        $customer = Customer::factory()->create(['created_by' => $owner->id]);

        $invoice = app(InvoiceService::class)->create([
            'customer_id' => $customer->id,
            'issue_date' => '2026-06-15',
            'currency_code' => 'SAR',
            'discount_type' => DiscountType::None->value,
            'discount_value' => 0,
        ], [[
            'material_id' => $material->id,
            'quantity' => 1,
            'tax_rate' => 0,
        ]], $owner);

        $this->actingAs($other)
            ->get("/invoices/{$invoice->id}")
            ->assertForbidden();
    }

    public function test_supplier_cannot_upload_image_for_another_suppliers_material(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();
        $materialB = Material::factory()->create(['supplier_id' => $supplierB->id]);

        $user = User::factory()->supplier($supplierA)->create();

        $this->actingAs($user)
            ->post("/materials/{$materialB->id}/image", [
                'image' => UploadedFile::fake()->image('shot.png'),
            ])
            ->assertForbidden();
    }
}
