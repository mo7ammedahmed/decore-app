<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'shop_name', 'tagline', 'logo_path', 'phone', 'email', 'address', 'city',
    'country_code', 'tax_number', 'commercial_registration',
    'invoice_template', 'invoice_accent', 'invoice_footer_note', 'invoice_thank_you',
])]
class ShopSetting extends Model
{
    public const INVOICE_TEMPLATES = ['classic', 'modern', 'minimal'];

    /**
     * Defaults make `instance()` usable before the row has been seeded — the
     * app falls back to these values instead of nulling the brand everywhere.
     */
    protected $attributes = [
        'shop_name' => 'Decore',
        'tagline' => 'Decoration materials atelier',
        'invoice_template' => 'classic',
        'invoice_accent' => '#8a6d3b',
        'invoice_thank_you' => 'Thank you for your business',
    ];

    protected function casts(): array
    {
        return [
            'invoice_accent' => 'string',
        ];
    }

    /**
     * The application is a single-tenant shop — there is exactly one settings
     * row. Returns the row or a defaults-only instance without persisting.
     */
    public static function instance(): self
    {
        return static::query()->firstOrNew([]);
    }

    /**
     * Public URL for the stored logo, if any.
     */
    public function logoUrl(): ?string
    {
        if ($this->logo_path === null) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    /**
     * Delete the stored logo file, ignoring missing files.
     */
    public function deleteStoredLogo(): void
    {
        if ($this->logo_path !== null) {
            Storage::disk('public')->delete($this->logo_path);
        }
    }

    /**
     * Brand fields safe to share with every page (guests included).
     *
     * @return array<string, mixed>
     */
    public function publicFields(): array
    {
        return [
            'shop_name' => $this->shop_name,
            'tagline' => $this->tagline,
            'logo_url' => $this->logoUrl(),
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'country_code' => $this->country_code,
            'tax_number' => $this->tax_number,
            'commercial_registration' => $this->commercial_registration,
        ];
    }

    /**
     * Everything the settings page and the printable invoice need.
     *
     * @return array<string, mixed>
     */
    public function printFields(): array
    {
        return [
            ...$this->publicFields(),
            'invoice_template' => $this->invoice_template,
            'invoice_accent' => $this->invoice_accent,
            'invoice_footer_note' => $this->invoice_footer_note,
            'invoice_thank_you' => $this->invoice_thank_you,
        ];
    }
}
