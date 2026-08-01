<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'section_id', 'disk', 'path', 'original_name', 'mime_type', 'size',
    'alt_text', 'is_visible', 'sort_order',
])]
class GalleryImage extends Model
{
    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
            'size' => 'integer',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(GallerySection::class, 'section_id');
    }

    /**
     * Public URL for the stored image on its own disk (each row records which
     * disk it lives on — S3 in production, public locally).
     */
    public function getImageUrlAttribute(): ?string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Delete the underlying stored image file, ignoring missing files.
     */
    public function deleteStoredFile(): void
    {
        Storage::disk($this->disk)->delete($this->path);
    }

    /**
     * When the row is permanently removed, delete the stored file so the disk
     * is not left with orphaned assets.
     */
    protected static function booted(): void
    {
        static::deleted(function (GalleryImage $image) {
            $image->deleteStoredFile();
        });
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
