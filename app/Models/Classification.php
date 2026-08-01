<?php

namespace App\Models;

use Database\Factories\ClassificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name_en', 'name_ar', 'slug', 'description', 'is_active', 'sort_order'])]
class Classification extends Model
{
    /** @use HasFactory<ClassificationFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The display name resolves to the Arabic translation when the active
     * locale is Arabic and one exists; otherwise it falls back to the
     * canonical (English) name.
     */
    protected $appends = ['localized_name'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function getLocalizedNameAttribute(): string
    {
        // name_en may be unloaded on partial-column selects — never return
        // null from a string accessor.
        return app()->getLocale() === 'ar' && $this->name_ar
            ? $this->name_ar
            : ($this->name_en ?? '');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
