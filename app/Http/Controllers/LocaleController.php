<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cookie;

class LocaleController extends Controller
{
    /**
     * Persist the chosen locale for the current browser and return to the
     * page the user was on. The SetLocale middleware picks the cookie up on
     * the next request and the shared Inertia `locale` prop re-renders the UI.
     */
    public function update(string $locale): RedirectResponse
    {
        abort_unless(array_key_exists($locale, config('app.available_locales')), 404);

        return redirect()->back()->withCookie(
            Cookie::forever('locale', $locale)
        );
    }
}
