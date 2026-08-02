<?php

namespace Tests\Feature;

use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks server-side localization of strings that reach the browser: Form
 * Request validation messages, :attribute labels, abort() messages, and the
 * localized email-template defaults. The SetLocale middleware resolves the
 * active locale before validation, so trans()/__() render the right language.
 */
class ServerLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_custom_validation_message_translates_to_arabic(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withCookie('locale', 'ar')
            ->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'New Supplier',
                'email' => 'supplier@decore.test',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'supplier',
            ])
            ->assertSessionHasErrors('supplier_id');

        $this->assertSame(
            'يجب اختيار مورد لحسابات الموردين.',
            session('errors')->get('supplier_id')[0],
        );
    }

    public function test_custom_validation_message_defaults_to_english(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'New Supplier',
                'email' => 'supplier@decore.test',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => 'supplier',
            ])
            ->assertSessionHasErrors('supplier_id');

        $this->assertSame(
            'A supplier must be selected for supplier accounts.',
            session('errors')->get('supplier_id')[0],
        );
    }

    public function test_default_validation_message_uses_localized_attribute(): void
    {
        $admin = User::factory()->admin()->create();

        // Missing email triggers the default `required` rule whose :attribute
        // placeholder resolves through the localized attributes array.
        $this->withCookie('locale', 'ar')
            ->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'No Email',
                'role' => 'sales_staff',
            ])
            ->assertSessionHasErrors('email');

        $this->assertSame(
            'حقل البريد الإلكتروني مطلوب.',
            session('errors')->get('email')[0],
        );
    }

    public function test_abort_messages_translate_per_locale(): void
    {
        $this->assertSame(
            'You do not have permission to access this area.',
            __('errors.area_forbidden', [], 'en'),
        );
        $this->assertSame(
            'ليس لديك صلاحية للوصول إلى هذه المنطقة.',
            __('errors.area_forbidden', [], 'ar'),
        );
        $this->assertSame(
            'تم تعطيل حسابك. يرجى التواصل مع المسؤول.',
            __('errors.account_disabled', [], 'ar'),
        );
    }

    public function test_email_template_defaults_are_localized(): void
    {
        app()->setLocale('ar');

        $fields = ShopSetting::instance()->profileFields();

        $this->assertSame('استفسار جديد: {subject}', $fields['contact_notification_subject_template']);
        $this->assertSame(
            'شكرًا لرسالتك حول {subject}',
            $fields['contact_auto_reply_subject_template'],
        );
        $this->assertStringContainsString('مع التحية،', $fields['contact_auto_reply_body_template']);

        app()->setLocale('en');

        $fields = ShopSetting::instance()->profileFields();

        $this->assertSame('New enquiry: {subject}', $fields['contact_notification_subject_template']);
        $this->assertSame(
            'Thanks for your message about {subject}',
            $fields['contact_auto_reply_subject_template'],
        );
    }
}
