<?php

namespace App\Models;

use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'platform', 'tracking_id', 'installation_method', 'head_code', 'body_code', 'is_enabled',
])]
class TrackingIntegration extends Model
{
    /**
     * The migration deliberately names the table `tracking_integrations`
     * (plural) — Eloquent's default pluralisation of the class name matches,
     * so no explicit $table is required.
     */
    protected $attributes = [
        'installation_method' => TrackingInstallationMethod::Managed->value,
    ];

    protected function casts(): array
    {
        return [
            'platform' => TrackingPlatform::class,
            'installation_method' => TrackingInstallationMethod::class,
            'is_enabled' => 'boolean',
        ];
    }
}
