<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_switching_locale_persists_the_cookie_and_redirects_back(): void
    {
        $response = $this->from('/catalog')->post('/locale/ar');

        $response->assertRedirect('/catalog');
        $response->assertCookie('locale', 'ar');
    }

    public function test_invalid_locale_is_rejected_with_404(): void
    {
        $this->post('/locale/xx')->assertNotFound();
    }

    public function test_locale_cookie_drives_the_shared_inertia_locale_prop(): void
    {
        $response = $this->withCookie('locale', 'ar')->get('/');

        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Landing')
            ->where('locale', 'ar')
            ->where('availableLocales.en', 'English')
            ->where('availableLocales.ar', 'العربية'));
    }

    public function test_unknown_locale_cookie_falls_back_to_the_default_locale(): void
    {
        $response = $this->withCookie('locale', 'xx')->get('/');

        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Landing')
            ->where('locale', 'en'));
    }

    public function test_landing_defaults_to_english_without_a_locale_cookie(): void
    {
        $response = $this->get('/');

        $response->assertInertia(fn ($assert) => $assert
            ->component('Public/Landing')
            ->where('locale', 'en'));
    }
}
