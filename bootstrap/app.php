<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureRole::class,
            'active' => EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // 419 "Page Expired": the CSRF token doesn't match the session (e.g.
        // the page sat open past the session lifetime, or the session was
        // regenerated after signing in elsewhere). Note: the framework maps
        // TokenMismatchException to a Symfony HttpException(419) in
        // prepareException() before render callbacks run, so we must match on
        // the mapped type, not the original exception. Instead of a dead-end
        // error page, recover to the login screen with a bilingual flash
        // message and remember the intended destination so the user lands back
        // where they were after signing in. JSON consumers (analytics beacon)
        // get a plain 419 they already ignore.
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() !== 419) {
                return null; // fall through to default handling
            }

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => __('auth.session_expired')], 419);
            }

            return redirect()->guest(route('login'))->with('error', 'auth.session_expired');
        });
    })->create();
