<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExchangeRateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seeds SAR (base) + USD and one SAR->USD exchange rate so the
        // index query has data to eager-load against.
        $this->seedCurrencies(withUsdRate: true);
    }

    public function test_admin_can_view_exchange_rates_index_with_eager_loaded_currencies(): void
    {
        $user = User::factory()->admin()->create();

        // Regression: the eager loads previously forced `select id, code,
        // name from currencies`, but currencies has `code` as its primary
        // key and no `id` column — the page threw a 500.
        $this->actingAs($user)
            ->get('/exchange-rates')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ExchangeRates/Index')
                ->has('rates.data', 1)
                ->has('rates.data.0.base_currency.code')
                ->has('rates.data.0.quote_currency.name'));
    }

    public function test_accountant_can_view_exchange_rates_index(): void
    {
        $user = User::factory()->accountant()->create();

        $this->actingAs($user)
            ->get('/exchange-rates')
            ->assertOk();
    }

    public function test_sales_staff_cannot_view_exchange_rates(): void
    {
        $user = User::factory()->salesStaff()->create();

        $this->actingAs($user)
            ->get('/exchange-rates')
            ->assertForbidden();
    }

    public function test_admin_can_store_an_exchange_rate(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/exchange-rates', [
                'base_currency_code' => 'SAR',
                'quote_currency_code' => 'USD',
                'rate' => '3.75000000',
                'effective_date' => now()->toDateString(),
            ])
            ->assertRedirect(route('exchange-rates.index'));

        $this->assertDatabaseHas('exchange_rates', [
            'base_currency_code' => 'SAR',
            'quote_currency_code' => 'USD',
        ]);
    }
}
