<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class NavigationSmokeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Every sidebar navigation item (from resources/js/Utilities/navigation.ts),
     * mapped to its route name and expected Inertia component. A 200 with the
     * wrong component is just as broken as a 500 — e.g. a dead route name that
     * Ziggy silently renders as a literal URL, or a binding regression that
     * makes an index action error out. Using a data provider keeps each nav
     * item an isolated test case with a clear failure message.
     *
     * @return array<string, array{routeName: string, component: string}>
     */
    public static function navRoutes(): array
    {
        return [
            'dashboard' => ['routeName' => 'dashboard', 'component' => 'Dashboard'],
            'users' => ['routeName' => 'users.index', 'component' => 'Users/Index'],
            'suppliers' => ['routeName' => 'suppliers.index', 'component' => 'Suppliers/Index'],
            'classifications' => ['routeName' => 'classifications.index', 'component' => 'Classifications/Index'],
            'materials' => ['routeName' => 'materials.index', 'component' => 'Materials/Index'],
            'customers' => ['routeName' => 'customers.index', 'component' => 'Customers/Index'],
            'invoices' => ['routeName' => 'invoices.index', 'component' => 'Invoices/Index'],
            'taxes' => ['routeName' => 'taxes.index', 'component' => 'Taxes/Index'],
            'currencies' => ['routeName' => 'currencies.index', 'component' => 'Currencies/Index'],
            'exchange_rates' => ['routeName' => 'exchange-rates.index', 'component' => 'ExchangeRates/Index'],
            'reports' => ['routeName' => 'reports.index', 'component' => 'Reports/Index'],
            'audit_logs' => ['routeName' => 'audit-logs.index', 'component' => 'AuditLogs/Index'],
            'gallery' => ['routeName' => 'gallery.index', 'component' => 'Gallery/Index'],
            'integrations' => ['routeName' => 'integrations.index', 'component' => 'Integrations/Index'],
            'settings' => ['routeName' => 'settings.edit', 'component' => 'Settings/Index'],
            'site_content' => ['routeName' => 'site-content.index', 'component' => 'SiteContent/Index'],
            'profile' => ['routeName' => 'settings.profile.edit', 'component' => 'Settings/Profile'],
        ];
    }

    #[DataProvider('navRoutes')]
    public function test_admin_can_open_navigation_page(string $routeName, string $component): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route($routeName))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }

    public function test_sidebar_navigation_pages_require_authentication(): void
    {
        foreach (array_column(self::navRoutes(), 'routeName') as $routeName) {
            $this->get(route($routeName))->assertRedirect(route('login'));
        }
    }
}
