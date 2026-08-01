<?php

namespace App\Models;

use App\Enums\Unit;
use Database\Factories\MaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'supplier_id', 'classification_id', 'name_en', 'name_ar', 'slug', 'sku',
    'description', 'unit', 'selling_price', 'default_supplier_cost',
    'currency_code', 'stock_quantity', 'minimum_stock_level', 'is_active',
    'image_disk', 'image_path', 'image_original_name', 'image_mime_type', 'image_size', 'image_alt_text',
])]
class Material extends Model
{
    /** @use HasFactory<MaterialFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Derived attributes serialized with every Material payload: the image URL
     * and the locale-aware display name (Arabic when the active locale is ar).
     */
    protected $appends = ['image_url', 'localized_name'];

    protected function casts(): array
    {
        return [
            'unit' => Unit::class,
            'selling_price' => 'decimal:2',
            'default_supplier_cost' => 'decimal:2',
            'stock_quantity' => 'integer',
            'minimum_stock_level' => 'integer',
            'is_active' => 'boolean',
            'image_size' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function classification(): BelongsTo
    {
        return $this->belongsTo(Classification::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function costRecords(): HasMany
    {
        return $this->hasMany(SupplierCostRecord::class);
    }

    /**
     * Generate a public URL for the stored product image using the Laravel
     * filesystem (returns null when no image has been uploaded).
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path === null) {
            return null;
        }

        return Storage::disk($this->image_disk)->url($this->image_path);
    }

    /**
     * Display name — Arabic translation when the active locale is Arabic and
     * one exists, otherwise the canonical (English) name.
     */
    public function getLocalizedNameAttribute(): string
    {
        // name_en may be unloaded on partial-column selects (e.g. invoice item
        // relations) — never return null from a string accessor.
        return app()->getLocale() === 'ar' && $this->name_ar
            ? $this->name_ar
            : ($this->name_en ?? '');
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
     * When a material is permanently deleted, remove its stored image file so
     * the disk is not left with orphaned assets. Soft deletes (archiving)
     * intentionally keep the file so the material can be restored.
     */
    protected static function booted(): void
    {
        static::forceDeleted(function (Material $material) {
            $material->deleteStoredImage();
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereNotNull('stock_quantity')
            ->whereNotNull('minimum_stock_level')
            ->whereColumn('stock_quantity', '<=', 'minimum_stock_level');
    }

    public function scopeForSupplier($query, int $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }
}
