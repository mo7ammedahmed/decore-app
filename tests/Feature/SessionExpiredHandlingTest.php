<?php

namespace Tests\Feature;

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class SessionExpiredHandlingTest extends TestCase
{
    /**
     * A 419 (CSRF token / session mismatch) must recover to the login screen
     * with a bilingual flash message instead of a dead-end error page.
     */
    public function test_token_mismatch_redirects_to_login_with_flash(): void
    {
        $request = Request::create('/settings/profile', 'PATCH');
        $request->headers->set('X-Inertia', 'true');

        $response = $this->app->make(ExceptionHandler::class)->render($request, new TokenMismatchException());

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertStringContainsString('/login', $response->headers->get('Location'));
        $this->assertEquals('auth.session_expired', session('error'));
    }

    /**
     * JSON consumers (e.g. the public analytics beacon) still receive a plain
     * 419 response, which they already ignore — no redirect, no HTML.
     */
    public function test_token_mismatch_json_request_gets_json_419(): void
    {
        $request = Request::create('/analytics/collect', 'POST', server: ['HTTP_ACCEPT' => 'application/json']);

        $response = $this->app->make(ExceptionHandler::class)->render($request, new TokenMismatchException());

        $this->assertEquals(419, $response->getStatusCode());
        $this->assertSame(
            ['message' => 'Your session has expired. Please sign in again.'],
            $response->getData(true),
        );
    }

    /**
     * Non-Inertia browser form posts (classic <form> submissions) also recover
     * to login rather than surfacing Laravel's raw error page.
     */
    public function test_token_mismatch_plain_post_redirects_to_login(): void
    {
        $request = Request::create('/settings', 'PATCH', ['foo' => 'bar']);

        $response = $this->app->make(ExceptionHandler::class)->render($request, new TokenMismatchException());

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertStringContainsString('/login', $response->headers->get('Location'));
    }

    /**
     * The render callback must only intercept status 419 — every other HTTP
     * exception (404, 403, …) falls through to Laravel's default handling.
     */
    public function test_non_419_http_exception_falls_through_to_default_handling(): void
    {
        $request = Request::create('/missing', 'GET');

        $response = $this->app->make(ExceptionHandler::class)->render($request, new NotFoundHttpException());

        $this->assertEquals(404, $response->getStatusCode());
        $this->assertNull($response->headers->get('Location'));
    }

    /**
     * An api/* request without an explicit JSON Accept header still gets a
     * plain JSON 419 (matching the app's shouldRenderJsonWhen contract), never
     * a redirect to the login screen.
     */
    public function test_api_request_gets_json_419_without_accept_header(): void
    {
        $request = Request::create('/api/whatever', 'POST');

        $response = $this->app->make(ExceptionHandler::class)->render($request, new HttpException(419));

        $this->assertEquals(419, $response->getStatusCode());
        $this->assertSame(
            ['message' => 'Your session has expired. Please sign in again.'],
            $response->getData(true),
        );
    }
}
