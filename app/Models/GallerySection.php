<?php

namespace App\Models;

use Database\Factories\GallerySectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name_en', 'name_ar', 'description_en', 'description_ar',
    'is_visible', 'sort_order',
])]
class GallerySection extends Model
{
    /** @use HasFactory<GallerySectionFactory> */
    use HasFactory;

    protected $appends = ['localized_name'];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'section_id');
    }

    /**
     * Display name — Arabic translation when the active locale is Arabic and
     * one exists, otherwise the canonical (English) name.
     */
    public function getLocalizedNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar
            ? $this->name_ar
            : ($this->name_en ?? '');
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
