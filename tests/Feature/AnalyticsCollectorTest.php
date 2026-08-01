<?php

namespace Tests\Feature;

use App\Models\PageView;
use App\Models\User;
use App\Models\VisitorSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsCollectorTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'event' => 'start',
            'session_id' => Str::uuid()->toString(),
            'page_id' => Str::uuid()->toString(),
            'path' => '/catalog',
            'title' => 'The catalog',
            'duration_seconds' => 4,
            'page_duration_seconds' => 2,
            'language' => 'en-US',
            'timezone' => 'Asia/Riyadh',
            'screen_width' => 1920,
            'screen_height' => 1080,
            'referrer' => 'https://example.com/project',
        ], $overrides);
    }

    public function test_guest_can_submit_start_event(): void
    {
        $this->postJson('/analytics/collect', $this->payload())
            ->assertStatus(202)
            ->assertJson(['accepted' => true]);

        $session = VisitorSession::query()->first();
        $this->assertNotNull($session);
        $this->assertSame('/catalog', $session->landing_page);
        $this->assertSame('/catalog', $session->last_page);
        $this->assertSame(1, $session->page_views_count);
        $this->assertSame(4, $session->duration_seconds);
        $this->assertSame('https://example.com/project', $session->referrer);
        $this->assertSame('Asia/Riyadh', $session->timezone);

        // The visitor hash is HMAC'd, never the raw IP.
        $this->assertSame(64, strlen($session->visitor_hash));
        $this->assertStringNotContainsString('127.0.0.1', $session->visitor_hash);

        $view = PageView::query()->first();
        $this->assertNotNull($view);
        $this->assertSame('/catalog', $view->path);
        $this->assertSame('The catalog', $view->title);
        $this->assertSame(2, $view->duration_seconds);
        $this->assertNull($view->left_at);
    }

    public function test_heartbeat_updates_duration_and_keeps_session(): void
    {
        $payload = $this->payload();
        $this->postJson('/analytics/collect', $payload)->assertStatus(202);

        $this->postJson('/analytics/collect', array_merge($payload, [
            'event' => 'heartbeat',
            'duration_seconds' => 30,
            'page_duration_seconds' => 12,
        ]))->assertStatus(202);

        $this->assertSame(1, VisitorSession::count());
        $this->assertSame(1, PageView::count());

        $session = VisitorSession::query()->first();
        $this->assertSame(30, $session->duration_seconds);

        $view = PageView::query()->first();
        $this->assertSame(12, $view->duration_seconds);
        $this->assertNull($view->left_at);
    }

    public function test_end_event_records_left_at(): void
    {
        $payload = $this->payload();
        $this->postJson('/analytics/collect', $payload)->assertStatus(202);

        $this->postJson('/analytics/collect', array_merge($payload, [
            'event' => 'end',
            'duration_seconds' => 45,
        ]))->assertStatus(202);

        $view = PageView::query()->first();
        $this->assertNotNull($view->left_at);
        $this->assertSame(45, VisitorSession::query()->first()->duration_seconds);
    }

    public function test_new_page_view_increments_count(): void
    {
        $payload = $this->payload();
        $this->postJson('/analytics/collect', $payload)->assertStatus(202);

        $this->postJson('/analytics/collect', array_merge($payload, [
            'event' => 'pageview',
            'page_id' => Str::uuid()->toString(),
            'path' => '/gallery',
            'title' => 'Our work',
        ]))->assertStatus(202);

        $this->assertSame(2, PageView::count());
        $session = VisitorSession::query()->first();
        $this->assertSame(2, $session->page_views_count);
        $this->assertSame('/gallery', $session->last_page);
    }

    public function test_invalid_event_is_rejected(): void
    {
        // Decore renders validation errors via redirect + session errors (the
        // Inertia convention; JSON rendering is reserved for api/* routes).
        $this->postJson('/analytics/collect', $this->payload(['event' => 'nonsense']))
            ->assertSessionHasErrors('event');

        $this->assertSame(0, VisitorSession::count());
    }

    public function test_missing_session_id_is_rejected(): void
    {
        $this->postJson('/analytics/collect', $this->payload(['session_id' => 'not-a-uuid']))
            ->assertSessionHasErrors('session_id');
    }

    public function test_dashboard_exposes_analytics_for_admin_only(): void
    {
        $admin = User::factory()->admin()->create();
        $sales = User::factory()->salesStaff()->create();

        // A session + page view inside the current month (default dashboard period).
        $session = VisitorSession::query()->create([
            'session_uuid' => Str::uuid()->toString(),
            'visitor_hash' => str_repeat('a', 64),
            'started_at' => now(),
            'last_seen_at' => now(),
            'duration_seconds' => 10,
            'page_views_count' => 1,
            'landing_page' => '/',
            'last_page' => '/',
        ]);
        PageView::query()->create([
            'visitor_session_id' => $session->id,
            'page_uuid' => Str::uuid()->toString(),
            'path' => '/',
            'entered_at' => now(),
            'duration_seconds' => 10,
        ]);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('metrics.analytics')
                ->where('metrics.analytics.summary.visitors', 1)
                ->where('metrics.analytics.summary.sessions', 1)
                ->where('metrics.analytics.summary.page_views', 1));

        // Sales staff must never see visitor analytics.
        $this->actingAs($sales)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->missing('metrics.analytics'));
    }
}
