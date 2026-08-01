<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSiteContentRequest;
use App\Models\SiteContent;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController extends Controller
{
    /**
     * Admin editor for every visitor-facing string — grouped by section so the
     * page can render tidy cards. Values are seeded empty; the page shows the
     * effective text (override ?? dictionary default) so admins see what
     * visitors actually read before editing.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', SiteContent::class);

        $rows = SiteContent::query()->get()->keyBy('key');

        $content = [];
        foreach (SiteContent::CONTENT_KEYS as $key) {
            $content[$key] = [
                'en' => $rows->get($key)?->value_en ?? '',
                'ar' => $rows->get($key)?->value_ar ?? '',
            ];
        }

        return Inertia::render('SiteContent/Index', [
            'content' => $content,
        ]);
    }

    public function update(UpdateSiteContentRequest $request): RedirectResponse
    {
        $this->authorize('update', SiteContent::class);

        $updates = $request->validatedContent();

        // Multi-row upsert — keep it atomic so a failure never leaves the
        // visitor content half-updated.
        \Illuminate\Support\Facades\DB::transaction(function () use ($updates) {
            foreach ($updates as $key => $values) {
                SiteContent::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'value_en' => $this->normalize($values['en'] ?? null),
                        'value_ar' => $this->normalize($values['ar'] ?? null),
                    ],
                );
            }
        });

        AuditService::log('site_content.updated', SiteContent::query()->firstOrNew([]), null, [
            'keys' => array_keys($updates),
        ], $request->user()->id);

        return back()->with('success', 'Public site content saved.');
    }

    private function normalize(?string $value): ?string
    {
        return $value !== null && trim($value) !== '' ? $value : null;
    }
}
