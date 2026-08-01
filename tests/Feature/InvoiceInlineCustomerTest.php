<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceInlineCustomerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
    }

    private function validPayload(Material $material, array $overrides = []): array
    {
        return array_merge([
            'issue_date' => '2026-08-01',
            'currency_code' => 'SAR',
            'discount_type' => 'none',
            'discount_value' => 0,
            'items' => [
                ['material_id' => $material->id, 'quantity' => 2, 'tax_rate' => 15],
            ],
        ], $overrides);
    }

    public function test_sales_staff_can_create_invoice_with_inline_customer(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);

        $response = $this->actingAs($sales)->post('/invoices', $this->validPayload($material, [
            'customer' => [
                'name' => 'Walk-in Client',
                'company_name' => 'Walk-in Co',
                'email' => 'walkin@example.com',
                'city' => 'Riyadh',
                'country_code' => 'SA',
            ],
        ]));

        $response->assertRedirect();

        $customer = Customer::query()->where('name', 'Walk-in Client')->first();
        $this->assertNotNull($customer);
        $this->assertSame($sales->id, $customer->created_by);
        $this->assertSame('walkin@example.com', $customer->email);

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'created_by' => $sales->id,
            'status' => 'draft',
        ]);
    }

    public function test_existing_customer_flow_still_works(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);
        $customer = Customer::factory()->create(['created_by' => $sales->id]);

        $this->actingAs($sales)
            ->post('/invoices', $this->validPayload($material, [
                'customer_id' => $customer->id,
            ]))
            ->assertRedirect();

        $this->assertDatabaseHas('invoices', ['customer_id' => $customer->id]);
        $this->assertSame(1, Customer::query()->count());
    }

    public function test_inline_customer_name_is_required(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);

        $this->actingAs($sales)
            ->post('/invoices', $this->validPayload($material, [
                'customer' => ['name' => '', 'email' => 'not-an-email'],
            ]))
            ->assertSessionHasErrors('customer.name');

        $this->assertSame(0, Customer::query()->count());
    }

    public function test_accountant_cannot_inline_create_customer(): void
    {
        $accountant = User::factory()->accountant()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);

        $this->actingAs($accountant)
            ->post('/invoices', $this->validPayload($material, [
                'customer' => ['name' => 'Should Fail'],
            ]))
            ->assertForbidden();

        $this->assertSame(0, Customer::query()->count());
        $this->assertDatabaseMissing('invoices', ['created_by' => $accountant->id]);
    }

    public function test_no_orphaned_customer_when_invoice_fails_validation(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);

        $this->actingAs($sales)
            ->post('/invoices', $this->validPayload($material, [
                'customer' => ['name' => 'Orphan Risk'],
                'items' => [['material_id' => 999999, 'quantity' => 1]],
            ]))
            ->assertSessionHasErrors('items.0.material_id');

        $this->assertSame(0, Customer::query()->count());
    }

    public function test_sales_staff_can_add_inline_customer_while_editing_a_draft(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);
        $customer = Customer::factory()->create(['created_by' => $sales->id]);
        $invoice = Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $sales->id,
        ]);

        $response = $this->actingAs($sales)->put("/invoices/{$invoice->id}", $this->validPayload($material, [
            'customer' => [
                'name' => 'Edited Walk-in',
                'email' => 'edited@example.com',
                'city' => 'Jeddah',
                'country_code' => 'SA',
            ],
        ]));

        $response->assertRedirect();

        $newCustomer = Customer::query()->where('name', 'Edited Walk-in')->first();
        $this->assertNotNull($newCustomer);
        $this->assertSame($sales->id, $newCustomer->created_by);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'customer_id' => $newCustomer->id,
        ]);
    }

    public function test_accountant_cannot_add_inline_customer_while_editing(): void
    {
        $accountant = User::factory()->accountant()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);
        $customer = Customer::factory()->create();
        $invoice = Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $accountant->id,
        ]);

        $this->actingAs($accountant)
            ->put("/invoices/{$invoice->id}", $this->validPayload($material, [
                'customer' => ['name' => 'Should Fail'],
            ]))
            ->assertForbidden();

        $this->assertSame(1, Customer::query()->count());
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'customer_id' => $customer->id,
        ]);
    }

    public function test_edit_requires_a_customer_id_or_inline_customer(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $material = Material::factory()->create(['currency_code' => 'SAR']);
        $customer = Customer::factory()->create(['created_by' => $sales->id]);
        $invoice = Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $sales->id,
        ]);

        // validPayload() never includes customer_id, so neither a customer_id
        // nor an inline customer is submitted — the required_without rule fires.
        $this->actingAs($sales)
            ->put("/invoices/{$invoice->id}", $this->validPayload($material))
            ->assertSessionHasErrors('customer_id');

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'customer_id' => $customer->id,
        ]);
    }

    public function test_edit_page_receives_can_create_customer_flag(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $customer = Customer::factory()->create(['created_by' => $sales->id]);
        $invoice = Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $sales->id,
        ]);

        $this->actingAs($sales)
            ->get("/invoices/{$invoice->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($assert) => $assert
                ->component('Invoices/Edit')
                ->where('canCreateCustomer', true));
    }
}
