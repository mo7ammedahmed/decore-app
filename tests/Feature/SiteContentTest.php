<?php

namespace Tests\Feature;

use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_view_the_site_content_editor(): void
    {
        $sales = User::factory()->salesStaff()->create();
        $this->actingAs($sales)->get('/settings/site-content')->assertForbidden();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/settings/site-content');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('SiteContent/Index'));

        // Content keys contain literal dots (landing.hero_line1) that Inertia's
        // dot-path assertions cannot traverse — read the props directly.
        $content = $response->viewData('page')['props']['content'];
        $this->assertSame('', $content['landing.hero_line1']['en']);
        $this->assertSame('', $content['landing.hero_line1']['ar']);
        $this->assertArrayHasKey('about.title', $content);
    }

    public function test_admin_can_update_content_and_guests_receive_the_override(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/site-content', [
                'content' => [
                    'landing.hero_line1' => ['en' => 'The surfaces that', 'ar' => 'الأسطح التي'],
                    'landing.cta_title' => ['en' => 'Ready to build?', 'ar' => 'جاهز للبناء؟'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('site_content', [
            'key' => 'landing.hero_line1',
            'value_en' => 'The surfaces that',
            'value_ar' => 'الأسطح التي',
        ]);

        // Guests receive the shared overrides in both locales.
        $en = $this->withCookie('locale', 'en')->get('/');
        $en->assertOk();
        $this->assertSame(
            'The surfaces that',
            $en->viewData('page')['props']['site_content']['landing.hero_line1']['en'],
        );

        $ar = $this->withCookie('locale', 'ar')->get('/');
        $ar->assertOk();
        $this->assertSame(
            'الأسطح التي',
            $ar->viewData('page')['props']['site_content']['landing.hero_line1']['ar'],
        );
    }

    public function test_clearing_a_value_returns_the_field_to_its_code_default(): void
    {
        SiteContent::query()->create([
            'key' => 'landing.hero_line1',
            'value_en' => 'Custom line',
            'value_ar' => null,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/site-content', [
                'content' => [
                    'landing.hero_line1' => ['en' => '   ', 'ar' => ''],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_content', [
            'key' => 'landing.hero_line1',
            'value_en' => null,
        ]);
    }

    public function test_unlisted_keys_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/site-content', [
                'content' => [
                    'landing.hero_line1' => ['en' => 'The surfaces that', 'ar' => null],
                    'nav.secret' => ['en' => 'injected', 'ar' => null],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('site_content', ['key' => 'nav.secret']);
        $this->assertDatabaseHas('site_content', ['key' => 'landing.hero_line1']);
    }
}
