<?php

namespace App\Http\Controllers;

use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use App\Http\Requests\UpdateTrackingIntegrationRequest;
use App\Models\TrackingIntegration;
use App\Services\AuditService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingIntegrationController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $this->authorize('viewAny', TrackingIntegration::class);

        $configured = TrackingIntegration::query()->get()->keyBy(fn ($row) => $row->platform->value);

        $platforms = collect(TrackingPlatform::cases())
            ->map(function (TrackingPlatform $platform) use ($configured): array {
                $integration = $configured->get($platform->value);

                $configuration = $integration !== null
                    ? [
                        'tracking_id' => $integration->tracking_id ?? '',
                        'installation_method' => $integration->installation_method->value,
                        'head_code' => $integration->head_code ?? '',
                        'body_code' => $integration->body_code ?? '',
                        'is_enabled' => $integration->is_enabled,
                        'is_configured' => true,
                    ]
                    : [
                        'tracking_id' => '',
                        'installation_method' => TrackingInstallationMethod::Managed->value,
                        'head_code' => '',
                        'body_code' => '',
                        'is_enabled' => false,
                        'is_configured' => false,
                    ];

                return [
                    'key' => $platform->value,
                    'label' => $platform->label(),
                    'category' => $platform->category(),
                    'description' => $platform->description(),
                    'placeholder' => $platform->placeholder(),
                    'id_label' => $platform->idLabel(),
                    'placement' => $platform->placement(),
                    'documentation_url' => $platform->documentationUrl(),
                    'diagnostics_url' => $platform->diagnosticsUrl(),
                    'diagnostics_label' => $platform->diagnosticsLabel(),
                    'brand_color' => $platform->brandColor(),
                    'monogram' => $platform->monogram(),
                    'has_body_fallback' => $platform->hasBodyFallback(),
                    'head_code_marker' => $platform->headCodeMarker(),
                    'body_code_marker' => $platform->bodyCodeMarker(),
                    ...$configuration,
                ];
            })
            ->values();

        return Inertia::render('Integrations/Index', [
            'platforms' => $platforms,
            'siteUrl' => route('landing'),
        ]);
    }

    public function update(
        UpdateTrackingIntegrationRequest $request,
        TrackingPlatform $platform,
    ): RedirectResponse {
        $this->authorize('update', TrackingIntegration::class);

        $data = $request->validated();
        $installationMethod = TrackingInstallationMethod::from($data['installation_method']);

        // Managed installs use the platform's standard snippet + tracking ID;
        // custom installs paste raw head/body code instead. Never store both.
        $data['tracking_id'] = $installationMethod === TrackingInstallationMethod::Managed
            ? ($data['tracking_id'] ?? null)
            : null;
        $data['head_code'] = $installationMethod === TrackingInstallationMethod::Custom
            ? ($data['head_code'] ?? null)
            : null;
        $data['body_code'] = $installationMethod === TrackingInstallationMethod::Custom
            ? ($data['body_code'] ?? null)
            : null;
        $data['is_enabled'] = $request->boolean('is_enabled');

        TrackingIntegration::query()->updateOrCreate(
            ['platform' => $platform->value],
            $data,
        );

        AuditService::log('tracking_integration.updated', null, null, [
            'platform' => $platform->value,
            'is_enabled' => $data['is_enabled'],
        ], $request->user()->id);

        return back()->with('success', 'tracking.updated');
    }

    public function destroy(Request $request, TrackingPlatform $platform): RedirectResponse
    {
        $this->authorize('delete', TrackingIntegration::class);

        TrackingIntegration::query()
            ->where('platform', $platform->value)
            ->delete();

        AuditService::log('tracking_integration.deleted', null, null, [
            'platform' => $platform->value,
        ], $request->user()->id);

        return back()->with('success', 'tracking.disconnected');
    }
}
