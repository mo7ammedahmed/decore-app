<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileSettingsRequest;
use App\Models\ShopSetting;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileSettingsController extends Controller
{
    public function edit(): Response
    {
        $this->authorize('viewAny', ShopSetting::class);

        return Inertia::render('Settings/Profile', [
            'settings' => ShopSetting::instance()->profileFields(),
        ]);
    }

    public function update(UpdateProfileSettingsRequest $request): RedirectResponse
    {
        $this->authorize('update', ShopSetting::class);

        $settings = ShopSetting::instance();
        $data = $request->validated();

        // Portrait handling: a new file replaces the old one, remove_portrait
        // clears it. Store the new file BEFORE deleting the old one so a
        // storage failure never destroys the existing portrait.
        if ($request->hasFile('portrait')) {
            $path = $request->file('portrait')->store('settings', (string) config('filesystems.default'));

            if ($path === false) {
                throw new \RuntimeException('Unable to store the portrait.');
            }

            $settings->deleteStoredPortrait();
            $data['portrait_path'] = $path;
        } elseif ($request->boolean('remove_portrait')) {
            $settings->deleteStoredPortrait();
            $data['portrait_path'] = null;
        }

        unset($data['portrait'], $data['remove_portrait']);

        // Blank template fields mean "use the built-in default".
        foreach ([
            'contact_notification_subject_template',
            'contact_notification_body_template',
            'contact_auto_reply_subject_template',
            'contact_auto_reply_body_template',
        ] as $templateField) {
            if (isset($data[$templateField]) && $data[$templateField] === '') {
                $data[$templateField] = null;
            }
        }

        $settings->fill($data)->save();

        AuditService::log('settings.profile_updated', $settings, null, [
            'shop_name' => $settings->shop_name,
            'name_ar' => $settings->name_ar,
            'role_en' => $settings->role_en,
            'glass_effect_enabled' => $settings->glass_effect_enabled,
            'theme_dark_accent' => $settings->theme_dark_accent,
        ], $request->user()->id);

        return back()->with('success', 'Profile settings saved.');
    }
}
