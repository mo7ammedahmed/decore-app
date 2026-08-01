<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    // Brand identity (settings page)
    'shop_name', 'tagline', 'logo_path', 'phone', 'email', 'address', 'city',
    'country_code', 'tax_number', 'commercial_registration',
    'invoice_template', 'invoice_accent', 'invoice_footer_note', 'invoice_thank_you',
    // Bilingual public identity (profile page)
    'name_ar', 'role_en', 'role_ar', 'short_pitch_en', 'short_pitch_ar',
    'bio_en', 'bio_ar', 'location_en', 'location_ar', 'linkedin', 'github',
    'whatsapp', 'website', 'resume_url', 'portrait_path', 'is_published', 'is_available',
    // Contact email delivery
    'contact_notification_email', 'contact_notification_subject_template',
    'contact_notification_body_template', 'contact_auto_reply_enabled',
    'contact_auto_reply_subject_template', 'contact_auto_reply_body_template',
    // Theme palettes
    'theme_dark_accent', 'theme_dark_background', 'theme_dark_surface',
    'theme_dark_foreground', 'theme_dark_muted', 'theme_light_accent',
    'theme_light_background', 'theme_light_surface', 'theme_light_foreground',
    'theme_light_muted', 'glass_effect_enabled',
    // Public landing-page structure
    'landing_sections', 'featured_material_ids',
    'hero_image_id', 'cta_image_id',
    'why_cards', 'journey_steps',
])]
class ShopSetting extends Model
{
    /**
     * The landing-page sections an admin can show or hide from the dashboard.
     * The hero is deliberately not included — it is the page's primary job.
     */
    public const LANDING_SECTIONS = ['collections', 'featured', 'inspiration', 'why', 'journey', 'cta'];

    /**
     * Landing section visibility with defaults, e.g.
     * ['featured' => false, 'inspiration' => false] leaves the rest on.
     * Unknown keys are ignored so a stale override can never hide a section
     * that no longer exists.
     *
     * The settings form submits multipart data (it also uploads the logo), so
     * unchecked checkboxes arrive as the strings "0" / "false" rather than
     * the boolean false — both must disable the section.
     *
     * @return array<string, bool>
     */
    public function landingSectionFlags(): array
    {
        $flags = array_fill_keys(self::LANDING_SECTIONS, true);

        foreach ((array) $this->landing_sections as $key => $value) {
            if (in_array($key, self::LANDING_SECTIONS, true) && ! filter_var($value, FILTER_VALIDATE_BOOLEAN)) {
                $flags[$key] = false;
            }
        }

        return $flags;
    }

    public const INVOICE_TEMPLATES = ['classic', 'modern', 'minimal'];

    public const DEFAULT_NOTIFICATION_SUBJECT = 'New enquiry: {subject}';

    public const DEFAULT_NOTIFICATION_BODY = "You received a new enquiry.\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\n{message}";

    public const DEFAULT_AUTO_REPLY_SUBJECT = 'Thanks for your message about {subject}';

    public const DEFAULT_AUTO_REPLY_BODY = "Hi {name},\n\nThanks for reaching out. I received your message and will get back to you soon.\n\nBest,\n{shop_name}";

    /**
     * Defaults make `instance()` usable before the row has been seeded — the
     * app falls back to these values instead of nulling the brand everywhere.
     */
    protected $attributes = [
        'shop_name' => 'Decore',
        'tagline' => 'Decoration materials atelier',
        'invoice_template' => 'classic',
        'invoice_accent' => '#8a6d3b',
        'invoice_thank_you' => 'Thank you for your business',
        'contact_notification_subject_template' => self::DEFAULT_NOTIFICATION_SUBJECT,
        'contact_notification_body_template' => self::DEFAULT_NOTIFICATION_BODY,
        'contact_auto_reply_enabled' => true,
        'contact_auto_reply_subject_template' => self::DEFAULT_AUTO_REPLY_SUBJECT,
        'contact_auto_reply_body_template' => self::DEFAULT_AUTO_REPLY_BODY,
        'is_published' => true,
        'is_available' => true,
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
    ];

    protected function casts(): array
    {
        return [
            'invoice_accent' => 'string',
            'is_published' => 'boolean',
            'is_available' => 'boolean',
            'contact_auto_reply_enabled' => 'boolean',
            'glass_effect_enabled' => 'boolean',
            'landing_sections' => 'array',
            'featured_material_ids' => 'array',
            'hero_image_id' => 'integer',
            'cta_image_id' => 'integer',
            'why_cards' => 'array',
            'journey_steps' => 'array',
        ];
    }

    /**
     * The application is a single-tenant shop — there is exactly one settings
     * row. Returns the row or a defaults-only instance without persisting.
     */
    public static function instance(): self
    {
        return static::query()->firstOrNew([]);
    }

    /**
     * Public URL for the stored logo, if any. The logo lives on the configured
     * default disk (S3 in production, public locally) so it follows the
     * app-wide storage decision.
     */
    public function logoUrl(): ?string
    {
        if ($this->logo_path === null) {
            return null;
        }

        return Storage::disk((string) config('filesystems.default'))->url($this->logo_path);
    }

    /**
     * Delete the stored logo file, ignoring missing files.
     */
    public function deleteStoredLogo(): void
    {
        if ($this->logo_path !== null) {
            Storage::disk((string) config('filesystems.default'))->delete($this->logo_path);
        }
    }

    /**
     * Public URL for the stored portrait, if any. Lives on the same default
     * disk as the logo so it follows the app-wide storage decision.
     */
    public function portraitUrl(): ?string
    {
        if ($this->portrait_path === null) {
            return null;
        }

        return Storage::disk((string) config('filesystems.default'))->url($this->portrait_path);
    }

    /**
     * Delete the stored portrait file, ignoring missing files.
     */
    public function deleteStoredPortrait(): void
    {
        if ($this->portrait_path !== null) {
            Storage::disk((string) config('filesystems.default'))->delete($this->portrait_path);
        }
    }

    /**
     * Email template values, falling back to the built-in defaults so the
     * profile form always shows something editable.
     *
     * @return array{subject: string, body: string}
     */
    private function notificationTemplates(): array
    {
        return [
            'subject' => $this->contact_notification_subject_template ?: self::DEFAULT_NOTIFICATION_SUBJECT,
            'body' => $this->contact_notification_body_template ?: self::DEFAULT_NOTIFICATION_BODY,
        ];
    }

    /**
     * Auto-reply template values, falling back to the built-in defaults.
     *
     * @return array{subject: string, body: string}
     */
    private function autoReplyTemplates(): array
    {
        return [
            'subject' => $this->contact_auto_reply_subject_template ?: self::DEFAULT_AUTO_REPLY_SUBJECT,
            'body' => $this->contact_auto_reply_body_template ?: self::DEFAULT_AUTO_REPLY_BODY,
        ];
    }

    /**
     * Everything the profile settings page needs (admin only).
     *
     * @return array<string, mixed>
     */
    public function profileFields(): array
    {
        $notification = $this->notificationTemplates();
        $autoReply = $this->autoReplyTemplates();

        return [
            ...$this->printFields(),
            'name_ar' => $this->name_ar,
            'role_en' => $this->role_en,
            'role_ar' => $this->role_ar,
            'short_pitch_en' => $this->short_pitch_en,
            'short_pitch_ar' => $this->short_pitch_ar,
            'bio_en' => $this->bio_en,
            'bio_ar' => $this->bio_ar,
            'location_en' => $this->location_en,
            'location_ar' => $this->location_ar,
            'linkedin' => $this->linkedin,
            'github' => $this->github,
            'whatsapp' => $this->whatsapp,
            'website' => $this->website,
            'resume_url' => $this->resume_url,
            'portrait_url' => $this->portraitUrl(),
            'is_published' => $this->is_published,
            'is_available' => $this->is_available,
            'contact_notification_email' => $this->contact_notification_email,
            'contact_notification_subject_template' => $notification['subject'],
            'contact_notification_body_template' => $notification['body'],
            'contact_auto_reply_enabled' => $this->contact_auto_reply_enabled,
            'contact_auto_reply_subject_template' => $autoReply['subject'],
            'contact_auto_reply_body_template' => $autoReply['body'],
            'theme_dark_accent' => $this->theme_dark_accent,
            'theme_dark_background' => $this->theme_dark_background,
            'theme_dark_surface' => $this->theme_dark_surface,
            'theme_dark_foreground' => $this->theme_dark_foreground,
            'theme_dark_muted' => $this->theme_dark_muted,
            'theme_light_accent' => $this->theme_light_accent,
            'theme_light_background' => $this->theme_light_background,
            'theme_light_surface' => $this->theme_light_surface,
            'theme_light_foreground' => $this->theme_light_foreground,
            'theme_light_muted' => $this->theme_light_muted,
            'glass_effect_enabled' => $this->glass_effect_enabled,
        ];
    }

    /**
     * Public-facing identity + palette safe to share with guest pages so the
     * visitor site reflects what the admin saved (accent colour, glass on/off,
     * bilingual name/role and contact links).
     *
     * @return array<string, mixed>
     */
    public function publicProfileFields(): array
    {
        return [
            'name_en' => $this->shop_name,
            'name_ar' => $this->name_ar,
            'role_en' => $this->role_en,
            'role_ar' => $this->role_ar,
            'short_pitch_en' => $this->short_pitch_en,
            'short_pitch_ar' => $this->short_pitch_ar,
            'bio_en' => $this->bio_en,
            'bio_ar' => $this->bio_ar,
            'location_en' => $this->location_en,
            'location_ar' => $this->location_ar,
            'linkedin' => $this->linkedin,
            'github' => $this->github,
            'whatsapp' => $this->whatsapp,
            'website' => $this->website,
            'resume_url' => $this->resume_url,
            'email' => $this->email,
            'phone' => $this->phone,
            'portrait_url' => $this->portraitUrl(),
            'is_published' => $this->is_published,
            'is_available' => $this->is_available,
            'palette' => [
                'dark_accent' => $this->theme_dark_accent,
                'dark_background' => $this->theme_dark_background,
                'dark_surface' => $this->theme_dark_surface,
                'dark_foreground' => $this->theme_dark_foreground,
                'dark_muted' => $this->theme_dark_muted,
                'light_accent' => $this->theme_light_accent,
                'light_background' => $this->theme_light_background,
                'light_surface' => $this->theme_light_surface,
                'light_foreground' => $this->theme_light_foreground,
                'light_muted' => $this->theme_light_muted,
            ],
            'glass_effect_enabled' => $this->glass_effect_enabled,
        ];
    }

    /**
     * Brand fields safe to share with every page (guests included).
     *
     * @return array<string, mixed>
     */
    public function publicFields(): array
    {
        return [
            'shop_name' => $this->shop_name,
            'tagline' => $this->tagline,
            'logo_url' => $this->logoUrl(),
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'country_code' => $this->country_code,
            'tax_number' => $this->tax_number,
            'commercial_registration' => $this->commercial_registration,
        ];
    }

    /**
     * Everything the settings page and the printable invoice need.
     *
     * @return array<string, mixed>
     */
    public function printFields(): array
    {
        return [
            ...$this->publicFields(),
            'invoice_template' => $this->invoice_template,
            'invoice_accent' => $this->invoice_accent,
            'invoice_footer_note' => $this->invoice_footer_note,
            'invoice_thank_you' => $this->invoice_thank_you,
            // Public landing-page structure (settings page form).
            'landing_sections' => $this->landingSectionFlags(),
            'featured_material_ids' => $this->featured_material_ids ?? [],
            'hero_image_id' => $this->hero_image_id,
            'cta_image_id' => $this->cta_image_id,
            'why_cards' => $this->why_cards ?? [],
            'journey_steps' => $this->journey_steps ?? [],
        ];
    }
}
