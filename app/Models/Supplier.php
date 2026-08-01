<?php

namespace App\Models;

use Database\Factories\SupplierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name', 'company_name', 'contact_person', 'email', 'phone',
    'tax_number', 'commercial_registration', 'address', 'city',
    'country_code', 'notes', 'is_active',
])]
class Supplier extends Model
{
    /** @use HasFactory<SupplierFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function costRecords(): HasMany
    {
        return $this->hasMany(SupplierCostRecord::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
