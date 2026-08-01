<?php

namespace Tests\Feature;

use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedCurrencies();
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'shop_name' => 'Decore',
            'name_ar' => 'ديكور',
            'role_en' => 'Decoration materials atelier',
            'role_ar' => 'استوديو مواد الديكور',
            'short_pitch_en' => 'Curated surfaces, honest pricing.',
            'short_pitch_ar' => 'أسطح مختارة وتسعير صادق.',
            'bio_en' => 'We supply wood, marble and wall-panel alternatives.',
            'bio_ar' => 'نوفر بدائل الخشب والرخام وألواح الجدران.',
            'location_en' => 'Riyadh, Saudi Arabia',
            'location_ar' => 'الرياض، المملكة العربية السعودية',
            'email' => 'hello@decore.example',
            'phone' => '+966 55 000 0000',
            'website' => 'https://decore.example',
            'linkedin' => null,
            'github' => null,
            'whatsapp' => null,
            'resume_url' => null,
            'is_published' => true,
            'is_available' => true,
            'contact_notification_email' => 'inbox@decore.example',
            'contact_notification_subject_template' => 'New enquiry: {subject}',
            'contact_notification_body_template' => "New enquiry.\n\nName: {name}\nEmail: {email}\n\n{message}",
            'contact_auto_reply_enabled' => true,
            'contact_auto_reply_subject_template' => 'Thanks for your message about {subject}',
            'contact_auto_reply_body_template' => "Hi {name},\n\nThanks for reaching out.",
            'theme_dark_accent' => '#8a6d3b',
            'theme_dark_background' => '#0a0a0a',
            'theme_dark_surface' => '#121212',
            'theme_dark_foreground' => '#f4f4f1',
            'theme_dark_muted' => '#a4a4a0',
            'theme_light_accent' => '#8a6d3b',
            'theme_light_background' => '#f4f3ee',
            'theme_light_surface' => '#ffffff',
            'theme_light_foreground' => '#0a0a0a',
            'theme_light_muted' => '#686864',
            'glass_effect_enabled' => true,
        ], $overrides);
    }

    public function test_admin_can_view_profile_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/settings/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Profile')
                ->has('settings.shop_name')
                ->has('settings.theme_dark_accent')
                ->has('settings.contact_notification_subject_template'));
    }

    public function test_admin_can_update_profile_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'shop_name' => 'Decore Atelier',
                'role_en' => 'Surfaces studio',
                'theme_dark_accent' => '#0f766e',
                'glass_effect_enabled' => false,
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect()
            ->assertSessionHas('success');

        $settings = ShopSetting::instance();
        $this->assertSame('Decore Atelier', $settings->shop_name);
        $this->assertSame('Surfaces studio', $settings->role_en);
        $this->assertSame('#0f766e', $settings->theme_dark_accent);
        $this->assertFalse($settings->glass_effect_enabled);
        $this->assertDatabaseHas('audit_logs', ['action' => 'settings.profile_updated']);
    }

    public function test_contact_email_and_phone_persist(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'email' => 'contact@decore.example',
                'phone' => '+966 50 123 4567',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertSame('contact@decore.example', $settings->email);
        $this->assertSame('+966 50 123 4567', $settings->phone);
    }

    public function test_invalid_hex_and_invalid_urls_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'theme_dark_accent' => 'red',
                'website' => 'not-a-url',
            ]))
            ->assertSessionHasErrors(['theme_dark_accent', 'website']);

        $this->assertSame('Decore', ShopSetting::instance()->shop_name);
    }

    public function test_portrait_upload_stores_and_replaces_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'portrait' => UploadedFile::fake()->create('portrait.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertNotNull($settings->portrait_path);
        Storage::disk('public')->assertExists($settings->portrait_path);

        $oldPath = $settings->portrait_path;

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'portrait' => UploadedFile::fake()->create('portrait2.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $fresh = ShopSetting::instance();
        $this->assertNotNull($fresh->portrait_path);
        $this->assertNotSame($oldPath, $fresh->portrait_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($fresh->portrait_path);
    }

    public function test_remove_portrait_clears_stored_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload([
                'portrait' => UploadedFile::fake()->create('portrait.png', 10, 'image/png'),
            ]))
            ->assertRedirect();

        $oldPath = ShopSetting::instance()->portrait_path;

        $this->actingAs($admin)
            ->patch('/settings/profile', $this->validPayload(['remove_portrait' => true]))
            ->assertRedirect();

        $settings = ShopSetting::instance();
        $this->assertNull($settings->portrait_path);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_non_admin_cannot_access_profile_page(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)->get('/settings/profile')->assertForbidden();
        $this->actingAs($sales)->patch('/settings/profile', $this->validPayload())->assertForbidden();
    }

    public function test_public_pages_receive_profile_identity_and_palette(): void
    {
        ShopSetting::query()->updateOrCreate(['id' => 1], [
            'shop_name' => 'Atelier Profile',
            'name_ar' => 'أتيليه',
            'role_en' => 'Surfaces studio',
            'theme_dark_accent' => '#0f766e',
            'glass_effect_enabled' => false,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Landing')
                ->where('profile.name_en', 'Atelier Profile')
                ->where('profile.name_ar', 'أتيليه')
                ->where('profile.role_en', 'Surfaces studio')
                ->where('profile.palette.dark_accent', '#0f766e')
                ->where('profile.glass_effect_enabled', false));
    }
}
