<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'session_uuid',
    'visitor_hash',
    'started_at',
    'last_seen_at',
    'duration_seconds',
    'page_views_count',
    'landing_page',
    'last_page',
    'referrer',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'browser',
    'platform',
    'device_type',
    'language',
    'timezone',
    'screen_width',
    'screen_height',
])]
class VisitorSession extends Model
{
    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'duration_seconds' => 'integer',
            'page_views_count' => 'integer',
            'screen_width' => 'integer',
            'screen_height' => 'integer',
        ];
    }
}
