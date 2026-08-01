<?php

namespace App\Http\Requests;

use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrackingIntegrationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('installation_method')) {
            $this->merge([
                'installation_method' => TrackingInstallationMethod::Managed->value,
            ]);
        }
    }

    public function authorize(): bool
    {
        return true; // Per-route middleware and policies enforce admin-only access.
    }

    public function rules(): array
    {
        $platform = $this->route('platform');
        $trackingPlatform = $platform instanceof TrackingPlatform
            ? $platform
            : TrackingPlatform::tryFrom((string) $platform);
        $installationMethod = TrackingInstallationMethod::tryFrom(
            (string) $this->string('installation_method'),
        );

        return [
            'installation_method' => ['required', Rule::enum(TrackingInstallationMethod::class)],
            'tracking_id' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf($installationMethod === TrackingInstallationMethod::Managed),
                ...($trackingPlatform !== null
                    && $installationMethod === TrackingInstallationMethod::Managed
                    ? ['regex:'.$trackingPlatform->validationPattern()]
                    : []),
            ],
            'head_code' => [
                'nullable',
                'string',
                'max:50000',
                Rule::requiredIf($installationMethod === TrackingInstallationMethod::Custom),
            ],
            'body_code' => [
                'nullable',
                'string',
                'max:50000',
            ],
            'is_enabled' => ['boolean'],
        ];
    }
}
