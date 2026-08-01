<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Resolve the active locale from the persisted cookie, falling back to the
     * configured default. Runs before HandleInertiaRequests so the shared
     * `locale` prop is always correct.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie('locale', (string) config('app.locale'));

        if (! array_key_exists($locale, config('app.available_locales'))) {
            $locale = (string) config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
