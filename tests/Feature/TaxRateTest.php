<?php

namespace Tests\Feature;

use App\Models\TaxRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TaxRateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_tax_rates_index(): void
    {
        $admin = User::factory()->admin()->create();
        TaxRate::factory()->create(['name' => 'VAT 15%', 'rate' => '15.000']);

        $this->actingAs($admin)
            ->get('/taxes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Taxes/Index')
                ->has('taxRates', 1)
                ->where('taxRates.0.name', 'VAT 15%'));
    }

    public function test_accountant_can_view_but_not_edit_tax_rates(): void
    {
        $accountant = User::factory()->accountant()->create();
        $tax = TaxRate::factory()->create();

        $this->actingAs($accountant)->get('/taxes')->assertOk();

        $this->actingAs($accountant)
            ->get(route('taxes.edit', $tax))
            ->assertForbidden();
    }

    public function test_admin_can_open_edit_page_with_the_real_tax_rate(): void
    {
        $admin = User::factory()->admin()->create();
        $tax = TaxRate::factory()->create(['name' => 'VAT 15%', 'rate' => '15.000']);

        // Regression: the route registered as taxes/{tax} while the controller
        // bound TaxRate $taxRate, so implicit binding never resolved and the
        // page received an empty model (blank form).
        $this->actingAs($admin)
            ->get(route('taxes.edit', $tax))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Taxes/Edit')
                ->where('taxRate.id', $tax->id)
                ->where('taxRate.name', 'VAT 15%')
                ->where('taxRate.rate', '15.000'));
    }

    public function test_admin_can_create_a_tax_rate(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('taxes.store'), [
                'name' => 'VAT 15%',
                'rate' => '15.000',
                'is_default' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'tax.created');

        $this->assertDatabaseHas('tax_rates', [
            'name' => 'VAT 15%',
            'rate' => '15.000',
        ]);
    }

    public function test_admin_can_update_a_tax_rate(): void
    {
        $admin = User::factory()->admin()->create();
        $tax = TaxRate::factory()->create(['name' => 'VAT 15%', 'rate' => '15.000']);

        $this->actingAs($admin)
            ->put(route('taxes.update', $tax), [
                'name' => 'VAT 16%',
                'rate' => '16.000',
                'is_default' => false,
                'is_active' => true,
            ])
            ->assertRedirect(route('taxes.index'))
            ->assertSessionHas('success', 'tax.updated');

        $this->assertDatabaseHas('tax_rates', [
            'id' => $tax->id,
            'name' => 'VAT 16%',
            'rate' => '16.000',
        ]);
    }

    public function test_admin_can_delete_a_non_default_tax_rate(): void
    {
        $admin = User::factory()->admin()->create();
        $tax = TaxRate::factory()->create(['is_default' => false]);

        $this->actingAs($admin)
            ->delete(route('taxes.destroy', $tax))
            ->assertRedirect(route('taxes.index'))
            ->assertSessionHas('success', 'tax.deleted');

        $this->assertDatabaseMissing('tax_rates', ['id' => $tax->id]);
    }

    public function test_default_tax_rate_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $default = TaxRate::factory()->create(['is_default' => true]);

        $this->actingAs($admin)
            ->delete(route('taxes.destroy', $default))
            ->assertRedirect()
            ->assertSessionHas('error', 'tax.delete_default_forbidden');

        $this->assertDatabaseHas('tax_rates', ['id' => $default->id]);
    }

    public function test_making_a_rate_default_clears_other_defaults(): void
    {
        $admin = User::factory()->admin()->create();
        $first = TaxRate::factory()->create(['is_default' => true]);
        $second = TaxRate::factory()->create(['is_default' => false]);

        $this->actingAs($admin)
            ->put(route('taxes.update', $second), [
                'name' => $second->name,
                'rate' => $second->rate,
                'is_default' => true,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertFalse($first->fresh()->is_default);
        $this->assertTrue($second->fresh()->is_default);
    }
}
