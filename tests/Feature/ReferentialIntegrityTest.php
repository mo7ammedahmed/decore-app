<?php

namespace Tests\Feature;

use App\Models\Classification;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferentialIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_supplier_with_materials_cannot_be_deleted(): void
    {
        $supplier = Supplier::factory()->create();
        Material::factory()->create(['supplier_id' => $supplier->id]);

        $this->actingAs($this->admin)
            ->delete("/suppliers/{$supplier->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_classification_with_materials_cannot_be_deleted(): void
    {
        $classification = Classification::factory()->create();
        Material::factory()->create(['classification_id' => $classification->id]);

        $this->actingAs($this->admin)
            ->delete("/classifications/{$classification->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('classifications', ['id' => $classification->id]);
    }

    public function test_material_referenced_by_invoice_items_cannot_be_deleted(): void
    {
        $material = Material::factory()->create();
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
            ->delete("/materials/{$material->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('materials', ['id' => $material->id]);
    }

    public function test_customer_with_invoices_cannot_be_deleted(): void
    {
        $customer = Customer::factory()->create(['created_by' => $this->admin->id]);
        Invoice::factory()->draft()->create([
            'customer_id' => $customer->id,
            'created_by' => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->delete("/customers/{$customer->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
    }

    public function test_empty_supplier_can_be_soft_deleted(): void
    {
        $supplier = Supplier::factory()->create();

        $this->actingAs($this->admin)
            ->delete("/suppliers/{$supplier->id}")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }
}
