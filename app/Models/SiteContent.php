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
        'landing.hero_kicker',
        'landing.hero_line1',
        'landing.hero_accent',
        'landing.hero_line2',
        'landing.hero_sub',
        'landing.hero_cta_catalog',
        'landing.hero_cta_gallery',
        'landing.trust_label',
        'landing.stat_materials',
        'landing.stat_classifications',
        'landing.stat_suppliers',
        // ---- Landing: collections ----
        'landing.collections_eyebrow',
        'landing.collections_title',
        'landing.collections_sub',
        'landing.materials_count',
        // ---- Landing: featured ----
        'landing.featured_eyebrow',
        'landing.featured_title',
        'landing.featured_sub',
        // ---- Landing: inspiration ----
        'landing.inspiration_eyebrow',
        'landing.inspiration_title',
        'landing.inspiration_sub',
        'landing.inspiration_cta',
        // ---- Landing: why (cards are structured via shop_settings why_cards;
        // only the section heading text stays editable here) ----
        'landing.why_eyebrow',
        'landing.why_title',
        'landing.why_sub',
        // ---- Landing: journey (steps are structured via shop_settings
        // journey_steps; only the section heading text stays editable here) ----
        'landing.journey_eyebrow',
        'landing.journey_title',
        'landing.journey_sub',
        // ---- Landing: CTA ----
        'landing.cta_title',
        'landing.cta_sub',
        'landing.cta_catalog',
        'landing.cta_gallery',
        'landing.cta_whatsapp',
        'landing.cta_contact',
        // ---- Catalog ----
        'catalog.eyebrow',
        'catalog.title',
        'catalog.sub',
        'catalog.search_placeholder',
        'catalog.filter_label',
        'catalog.all_collections',
        'catalog.results_count',
        'catalog.clear',
        'catalog.empty_title',
        'catalog.empty_desc',
        // ---- Public material card ----
        'pmc.from',
        'pmc.view',
        // ---- Material show ----
        'show.back',
        'show.supplied_by',
        'show.per_unit',
        'show.breadcrumb_home',
        'show.breadcrumb_catalog',
        'show.overview_label',
        'show.collection_label',
        'show.sku_label',
        'show.quote_cta',
        'show.whatsapp_cta',
        'show.related_title',
        'show.related_sub',
        // ---- About ----
        'about.eyebrow',
        'about.title',
        'about.lead',
        'about.what_title',
        'about.what_1_title',
        'about.what_1_body',
        'about.what_2_title',
        'about.what_2_body',
        'about.what_3_title',
        'about.what_3_body',
        'about.who_title',
        'about.who_1_title',
        'about.who_1_body',
        'about.who_2_title',
        'about.who_2_body',
        'about.who_3_title',
        'about.who_3_body',
        'about.who_4_title',
        'about.who_4_body',
        'about.suppliers_title',
        'about.suppliers_body',
        'about.cta_title',
        'about.cta_body',
        // ---- Contact ----
        'contact.eyebrow',
        'contact.title',
        'contact.sub',
        'contact.whatsapp_title',
        'contact.whatsapp_body',
        'contact.email_title',
        'contact.email_body',
        'contact.phone_title',
        'contact.phone_body',
        'contact.address_title',
        'contact.address_body',
        'contact.hours_title',
        'contact.hours_value',
        'contact.enquiry_title',
        'contact.enquiry_body',
        'contact.quote_cta',
        'contact.staff_sign_in',
        // ---- Gallery ----
        'gallery.eyebrow',
        'gallery.title',
        'gallery.sub',
        'gallery.all_sections',
        'gallery.empty_title',
        'gallery.empty_desc',
        // ---- Public header & footer ----
        'header.explore_materials',
        'footer.collections',
        'footer.explore',
        'footer.contact',
        'footer.follow',
        'footer.rights',
        'footer.staff_sign_in',
        'footer.working_hours',
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
