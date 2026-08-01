<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateShopSettingsRequest;
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
        ]);
    }

    public function update(UpdateShopSettingsRequest $request): RedirectResponse
    {
        $this->authorize('update', ShopSetting::class);

        $settings = ShopSetting::instance();
        $data = $request->validated();

        // Logo handling: a new file replaces the old one, remove_logo clears it.
        // Store the new file BEFORE deleting the old one so a storage failure
        // never destroys the existing logo.
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');

            if ($path === false) {
                throw new \RuntimeException('Unable to store the shop logo.');
            }

            $settings->deleteStoredLogo();
            $data['logo_path'] = $path;
        } elseif ($request->boolean('remove_logo')) {
            $settings->deleteStoredLogo();
            $data['logo_path'] = null;
        }

        unset($data['logo'], $data['remove_logo']);

        $settings->fill($data)->save();

        AuditService::log('settings.updated', $settings, null, [
            'shop_name' => $settings->shop_name,
            'invoice_template' => $settings->invoice_template,
        ], $request->user()->id);

        return back()->with('success', 'Shop settings saved.');
    }
}
