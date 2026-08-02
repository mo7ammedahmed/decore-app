<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateShopSettingsRequest;
use App\Models\GalleryImage;
use App\Models\Material;
use App\Models\ShopSetting;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(): Response
    {
        $this->authorize('viewAny', ShopSetting::class);

        return Inertia::render('Settings/Index', [
            'settings' => ShopSetting::instance()->printFields(),
            // Active finishes available for the featured-materials picker.
            'materials' => Material::query()
                ->active()
                ->orderBy('name_en')
                ->get(['id', 'name_en', 'name_ar', 'sku']),
            // Published portfolio images available for the hero + CTA pickers.
            'gallery_images' => GalleryImage::query()
                ->visible()
                ->whereHas('section', fn ($q) => $q->visible())
                ->with('section:id,name_en,name_ar')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'section_id', 'path', 'disk', 'alt_text'])
                ->map(fn (GalleryImage $image) => [
                    'id' => $image->id,
                    'image_url' => $image->image_url,
                    'alt_text' => $image->alt_text,
                    'section_name' => $image->section?->localized_name ?? 'Gallery image',
                ])
                ->values(),
        ]);
    }

    public function update(UpdateShopSettingsRequest $request): RedirectResponse
    {
        $this->authorize('update', ShopSetting::class);

        $settings = ShopSetting::instance();
        $data = $request->validated();

        // Logo handling: a new file replaces the old one, remove_logo clears it.
        // Store the new file BEFORE deleting the old one so a storage failure
        // never destroys the existing logo. Storage failures surface as a
        // localized error toast instead of a 500.
        try {
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('settings', (string) config('filesystems.default'));

                if ($path === false) {
                    throw new \RuntimeException(__('errors.logo_store_failed'));
                }

                $settings->deleteStoredLogo();
                $data['logo_path'] = $path;
            } elseif ($request->boolean('remove_logo')) {
                $settings->deleteStoredLogo();
                $data['logo_path'] = null;
            }
        } catch (\RuntimeException) {
            return back()->with('error', 'settings.logo_store_failed');
        }

        unset($data['logo'], $data['remove_logo']);

        $settings->fill($data)->save();

        AuditService::log('settings.updated', $settings, null, [
            'shop_name' => $settings->shop_name,
            'invoice_template' => $settings->invoice_template,
        ], $request->user()->id);

        return back()->with('success', 'settings.saved');
    }
}
