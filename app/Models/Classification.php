<?php

namespace App\Models;

use Database\Factories\ClassificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'name_en', 'name_ar', 'slug', 'description', 'is_active', 'sort_order',
    'image_disk', 'image_path', 'image_original_name', 'image_mime_type', 'image_size', 'image_alt_text',
])]
class Classification extends Model
{
    /** @use HasFactory<ClassificationFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The display name resolves to the Arabic translation when the active
     * locale is Arabic and one exists; otherwise it falls back to the
     * canonical (English) name. The image URL lets the landing tiles and
     * catalogue filters show the admin-chosen collection cover.
     */
    protected $appends = ['localized_name', 'image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'image_size' => 'integer',
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

    /**
     * Public URL for the admin-chosen collection cover, if one exists.
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path === null) {
            return null;
        }

        return Storage::disk($this->image_disk)->url($this->image_path);
    }

    /**
     * Delete the underlying stored image file, ignoring missing files.
     */
    public function deleteStoredImage(): void
    {
        if ($this->image_path !== null) {
            Storage::disk($this->image_disk)->delete($this->image_path);
        }
    }

    /**
     * When a classification is permanently deleted, remove its stored image
     * file so the disk is not left with orphaned assets. Soft deletes
     * (archiving) keep the file so the classification can be restored.
     */
    protected static function booted(): void
    {
        static::forceDeleted(function (Classification $classification) {
            $classification->deleteStoredImage();
        });
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
