<?php

namespace Tests\Feature;

use App\Models\TrackingIntegration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TrackingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_integrations_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/settings/integrations')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Integrations/Index')
                ->has('platforms', 10)
                ->where('platforms.0.key', 'google_tag')
                ->has('siteUrl'));
    }

    public function test_non_admin_cannot_access_integrations(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)->get('/settings/integrations')->assertForbidden();
        $this->actingAs($sales)
            ->put('/settings/integrations/meta_pixel', ['tracking_id' => '12345'])
            ->assertForbidden();
    }

    public function test_admin_can_enable_meta_pixel_with_valid_id(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put('/settings/integrations/meta_pixel', [
                'installation_method' => 'managed',
                'tracking_id' => '123456789012345',
                'is_enabled' => true,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $integration = TrackingIntegration::query()->where('platform', 'meta_pixel')->first();
        $this->assertNotNull($integration);
        $this->assertSame('123456789012345', $integration->tracking_id);
        $this->assertTrue($integration->is_enabled);
        $this->assertDatabaseHas('audit_logs', ['action' => 'tracking_integration.updated']);
    }

    public function test_invalid_tracking_id_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put('/settings/integrations/meta_pixel', [
                'installation_method' => 'managed',
                'tracking_id' => 'not-a-pixel-id',
                'is_enabled' => true,
            ])
            ->assertSessionHasErrors('tracking_id');

        $this->assertDatabaseCount('tracking_integrations', 0);
    }

    public function test_custom_code_install_accepts_head_code(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put('/settings/integrations/google_tag', [
                'installation_method' => 'custom',
                'head_code' => '<script>window.__MY_TAG__ = true;</script>',
                'is_enabled' => true,
            ])
            ->assertSessionHasNoErrors();

        $integration = TrackingIntegration::query()->where('platform', 'google_tag')->first();
        $this->assertSame('custom', $integration->installation_method->value);
        $this->assertStringContainsString('window.__MY_TAG__', $integration->head_code);
        // Managed-only fields are cleared for custom installs.
        $this->assertNull($integration->tracking_id);
    }

    public function test_enabled_integration_is_shared_and_rendered_on_public_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put('/settings/integrations/meta_pixel', [
            'installation_method' => 'managed',
            'tracking_id' => '123456789012345',
            'is_enabled' => true,
        ]);

        // The enabled pixel is shared into every Inertia payload…
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('tracking_integrations', 1)
                ->where('tracking_integrations.0.platform', 'meta_pixel'));

        // …and rendered as the official Meta snippet in the page head.
        $this->get('/')
            ->assertOk()
            ->assertSee('connect.facebook.net', false)
            ->assertSee('123456789012345', false);
    }

    public function test_disabled_integration_is_not_shared(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put('/settings/integrations/tiktok_pixel', [
            'installation_method' => 'managed',
            'tracking_id' => 'C1234567890ABCDE',
            'is_enabled' => false,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('tracking_integrations', 0));

        $this->get('/')->assertDontSee('analytics.tiktok.com', false);
    }

    public function test_disconnect_removes_integration(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put('/settings/integrations/meta_pixel', [
            'installation_method' => 'managed',
            'tracking_id' => '123456789012345',
            'is_enabled' => true,
        ]);

        $this->actingAs($admin)
            ->delete('/settings/integrations/meta_pixel')
            ->assertRedirect();

        $this->assertDatabaseCount('tracking_integrations', 0);
    }

    public function test_google_search_console_renders_verification_meta(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put('/settings/integrations/google_search_console', [
            'installation_method' => 'managed',
            'tracking_id' => 'abcdefghijklmnopqrstuvwxyz0123456789',
            'is_enabled' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertSee('google-site-verification', false);
    }
}
