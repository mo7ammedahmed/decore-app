<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">

@php
    // Enabled analytics/pixels, keyed by platform for the tracking components.
    $trackingIntegrations = collect(data_get($page, 'props.tracking_integrations', []))
        ->filter(fn (mixed $integration): bool => is_array($integration)
            && is_string(data_get($integration, 'platform')))
        ->keyBy('platform');
@endphp

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Decore') }}</title>
        <meta name="theme-color" content="#000000" />
        <meta name="csrf-token" content="{{ csrf_token() }}" />

        <x-tracking.head :integrations="$trackingIntegrations" />

        <!-- Fonts: Instrument Serif (headings) + Barlow (body); Arabic: Amiri + Noto Sans Arabic -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument+serif:400,400i&family=barlow:300,400,500,600&family=amiri:400,400i,700&family=noto+sans+arabic:300,400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-body antialiased">
        <x-tracking.body :integrations="$trackingIntegrations" />
        @inertia
    </body>
</html>
