<?php

namespace App\Http\Middleware;

use App\Models\Classification;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\ExchangeRate;
use App\Models\GallerySection;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Payment;
use App\Models\ShopSetting;
use App\Models\SiteContent;
use App\Models\Supplier;
use App\Models\TaxRate;
use App\Models\TrackingIntegration;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        // One row, one query — reused for both public identity views.
        $settings = ShopSetting::instance();

        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'availableLocales' => config('app.available_locales'),
            // Brand identity for headers, footers and public pages — editable by admins.
            'shop' => $settings->publicFields(),
            // Public-facing identity + theme palette — editable on the Profile settings page.
            'profile' => $settings->publicProfileFields(),
            // Main collections for the public header/footer navigation.
            'public_collections' => Classification::query()
                ->active()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->limit(6)
                ->get(['id', 'name_en', 'name_ar', 'slug']),
            // Admin-editable overrides for visitor-facing text (empty => code default).
            'site_content' => SiteContent::overrides(),
            // Enabled analytics/pixels rendered by the tracking blade components.
            'tracking_integrations' => TrackingIntegration::query()
                ->where('is_enabled', true)
                ->get(['platform', 'tracking_id', 'installation_method', 'head_code', 'body_code'])
                ->map(fn (TrackingIntegration $row) => [
                    'platform' => $row->platform->value,
                    'tracking_id' => $row->tracking_id,
                    'installation_method' => $row->installation_method->value,
                    'head_code' => $row->head_code,
                    'body_code' => $row->body_code,
                ])
                ->all(),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'supplier_id' => $user->supplier_id,
                    'is_active' => $user->is_active,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Presentation hints only — server policies remain the source of truth.
            'permissions' => $user ? [
                'users' => $user->can('viewAny', User::class),
                'suppliers' => $user->can('viewAny', Supplier::class),
                'classifications' => $user->can('viewAny', Classification::class),
                'materials' => $user->can('viewAny', Material::class),
                'customers' => $user->can('viewAny', Customer::class),
                'invoices' => $user->can('viewAny', Invoice::class),
                'payments' => $user->can('viewAny', Payment::class),
                'taxes' => $user->can('viewAny', TaxRate::class),
                'currencies' => $user->can('viewAny', Currency::class),
                'exchangeRates' => $user->can('viewAny', ExchangeRate::class),
                'reports' => in_array($user->role->value, ['admin', 'accountant'], true),
                'auditLogs' => in_array($user->role->value, ['admin', 'accountant'], true),
                'gallery' => $user->can('viewAny', GallerySection::class),
                'integrations' => $user->can('viewAny', TrackingIntegration::class),
                'settings' => $user->can('viewAny', ShopSetting::class),
                'manageCosts' => $user->role->canManageCosts(),
                'supplierOnly' => $user->isSupplier(),
            ] : null,
        ];
    }
}
