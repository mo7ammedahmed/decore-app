<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSiteContentRequest;
use App\Models\SiteContent;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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

        $submitted = $request->validatedContent();

        // Only persist keys whose value actually changed. The editor submits
        // the full content map on every save; upserting all 134 keys would be
        // hundreds of round-trips against a remote database and can exceed the
        // PHP execution limit on a slow connection.
        $rows = SiteContent::query()
            ->whereIn('key', array_keys($submitted))
            ->get()
            ->keyBy('key');

        $changed = [];
        foreach ($submitted as $key => $values) {
            $en = $this->normalize($values['en'] ?? null);
            $ar = $this->normalize($values['ar'] ?? null);
            $row = $rows->get($key);

            if ($row === null) {
                // New override — persist only when it actually overrides the
                // dictionary default (empty value means "keep the default").
                if ($en !== null || $ar !== null) {
                    $changed[$key] = ['value_en' => $en, 'value_ar' => $ar];
                }
            } elseif ($row->value_en !== $en || $row->value_ar !== $ar) {
                $changed[$key] = ['value_en' => $en, 'value_ar' => $ar];
            }
        }

        if ($changed === []) {
            return back()->with('success', 'Public site content saved.');
        }

        // Multi-row upsert — keep it atomic so a failure never leaves the
        // visitor content half-updated.
        DB::transaction(function () use ($changed) {
            foreach ($changed as $key => $values) {
                SiteContent::query()->updateOrCreate(['key' => $key], $values);
            }
        });

        AuditService::log('site_content.updated', SiteContent::query()->firstOrNew([]), null, [
            'keys' => array_keys($changed),
        ], $request->user()->id);

        return back()->with('success', 'Public site content saved.');
    }

    private function normalize(?string $value): ?string
    {
        return $value !== null && trim($value) !== '' ? $value : null;
    }
}
