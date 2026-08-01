<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value_en', 'value_ar'])]
class SiteContent extends Model
{
    /**
     * The migration deliberately names the table `site_content` (singular).
     */
    protected $table = 'site_content';

    /**
     * Every visitor-facing content key that admins can edit. This list mirrors
     * the public sections of the frontend dictionaries in
     * resources/js/Utilities/i18n.ts — the dictionary remains the fallback for
     * any key that has no stored override (empty string => code default).
     */
    public const CONTENT_KEYS = [
        // ---- Landing: hero ----
        'landing.hero_line1',
        'landing.hero_accent',
        'landing.hero_line2',
        'landing.hero_sub',
        'landing.browse_catalog',
        'landing.hero_badge_tag',
        'landing.hero_badge',
        'landing.trust_label',
        'landing.stat_materials',
        'landing.stat_classifications',
        'landing.stat_suppliers',
        // ---- Landing: capabilities ----
        'landing.atelier_eyebrow',
        'landing.capabilities_eyebrow',
        'landing.capabilities_title',
        'landing.capabilities_sub',
        'landing.cap1_title',
        'landing.cap1_body',
        'landing.cap2_title',
        'landing.cap2_body',
        'landing.cap3_title',
        'landing.cap3_body',
        'landing.cap2_tag1',
        'landing.cap2_tag2',
        'landing.cap2_tag3',
        'landing.cap2_tag4',
        'landing.cap3_tag1',
        'landing.cap3_tag2',
        'landing.cap3_tag3',
        'landing.cap3_tag4',
        // ---- Landing: featured + collections ----
        'landing.featured_title',
        'landing.collections_eyebrow',
        'landing.collections_title',
        'landing.materials_count',
        // ---- Landing: how it works ----
        'landing.how_eyebrow',
        'landing.how_title',
        'landing.how_sub',
        'landing.step1_title',
        'landing.step1_body',
        'landing.step2_title',
        'landing.step2_body',
        'landing.step3_title',
        'landing.step3_body',
        // ---- Landing: CTA ----
        'landing.cta_title',
        'landing.cta_authed',
        'landing.cta_guest',
        // ---- Catalog ----
        'catalog.eyebrow',
        'catalog.title',
        'catalog.sub',
        'catalog.search_placeholder',
        'catalog.filter_label',
        'catalog.all_collections',
        'catalog.empty_title',
        'catalog.empty_desc',
        'catalog.prices_note',
        // ---- Public material card ----
        'pmc.from',
        'pmc.view',
        // ---- Material show ----
        'show.back',
        'show.supplied_by',
        'show.per_unit',
        'show.interested',
        'show.quote',
        // ---- About ----
        'about.eyebrow',
        'about.title',
        'about.p1',
        'about.p2',
        'about.f1_title',
        'about.f1_body',
        'about.f2_title',
        'about.f2_body',
        'about.f3_title',
        'about.f3_body',
        'about.f4_title',
        'about.f4_body',
        // ---- Contact ----
        'contact.eyebrow',
        'contact.title',
        'contact.sub',
        'contact.email_title',
        'contact.email_body',
        'contact.phone_title',
        'contact.phone_body',
        'contact.workspace_title',
        'contact.workspace_body',
        'contact.workspace_value',
        'contact.partner_title',
        'contact.partner_body',
        'contact.partner_cta',
        // ---- Gallery ----
        'gallery.eyebrow',
        'gallery.title',
        'gallery.sub',
        'gallery.all_sections',
        'gallery.empty_title',
        'gallery.empty_desc',
        // ---- Taglines ----
        'public.tagline',
        'guest.tagline',
    ];

    /**
     * Stored overrides as `key => ['en' => ..., 'ar' => ...]`, shared into every
     * Inertia payload so the frontend translator can consult them.
     *
     * @return array<string, array{en: string|null, ar: string|null}>
     */
    public static function overrides(): array
    {
        return static::query()
            ->get()
            ->mapWithKeys(fn (SiteContent $row) => [
                $row->key => ['en' => $row->value_en, 'ar' => $row->value_ar],
            ])
            ->all();
    }
}
