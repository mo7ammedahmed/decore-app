<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ClassificationController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MaterialImageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxRateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ---- Public guest pages (no authentication required) ----
Route::get('/', [PublicController::class, 'landing'])->name('landing');
Route::get('/catalog', [PublicController::class, 'catalog'])->name('catalog');
Route::get('/catalog/{material:slug}', [PublicController::class, 'show'])->name('catalog.show');
Route::get('/about', [PublicController::class, 'about'])->name('about');
Route::get('/contact', [PublicController::class, 'contact'])->name('contact');

// ---- Locale switching (public) ----
Route::post('/locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ---- Users: admin only ----
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', UserController::class)->parameters(['users' => 'user']);
        Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
    });

    // ---- Master data ----
    Route::resource('suppliers', SupplierController::class);

    Route::middleware('role:admin')->group(function () {
        Route::resource('classifications', ClassificationController::class)->except(['show']);
    });

    Route::resource('materials', MaterialController::class)->parameters(['materials' => 'material']);

    Route::post('materials/{material}/image', [MaterialImageController::class, 'store'])->name('materials.image.store');
    Route::put('materials/{material}/image', [MaterialImageController::class, 'update'])->name('materials.image.update');
    Route::delete('materials/{material}/image', [MaterialImageController::class, 'destroy'])->name('materials.image.destroy');

    Route::resource('customers', CustomerController::class)->parameters(['customers' => 'customer']);

    // ---- Invoices & payments ----
    Route::resource('invoices', InvoiceController::class)->parameters(['invoices' => 'invoice']);
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');

    Route::middleware('role:admin,accountant')->group(function () {
        Route::post('invoices/{invoice}/issue', [InvoiceController::class, 'issue'])->name('invoices.issue');
        Route::post('invoices/{invoice}/complete', [InvoiceController::class, 'complete'])->name('invoices.complete');
        Route::post('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('invoices.cancel');

        Route::get('invoices/{invoice}/payments', [PaymentController::class, 'index'])->name('invoices.payments.index');
        Route::get('invoices/{invoice}/payments/create', [PaymentController::class, 'create'])->name('payments.create');
        Route::post('invoices/{invoice}/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('payments/{payment}/reverse', [PaymentController::class, 'reverse'])->name('payments.reverse');
    });

    // ---- Accounting settings ----
    Route::middleware('role:admin,accountant')->group(function () {
        Route::resource('taxes', TaxRateController::class)->parameters(['tax' => 'taxRate'])->except(['show']);
        Route::resource('currencies', CurrencyController::class)->except(['show']);
        Route::get('exchange-rates', [ExchangeRateController::class, 'index'])->name('exchange-rates.index');
        Route::post('exchange-rates', [ExchangeRateController::class, 'store'])->name('exchange-rates.store');
        Route::delete('exchange-rates/{exchangeRate}', [ExchangeRateController::class, 'destroy'])->name('exchange-rates.destroy');
    });

    // ---- Reports & audit (financial roles) ----
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // ---- Shop settings: admin only ----
    Route::middleware('role:admin')->group(function () {
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::get('settings/site-content', [SiteContentController::class, 'index'])->name('site-content.index');
        Route::patch('settings/site-content', [SiteContentController::class, 'update'])->name('site-content.update');
    });
});

require __DIR__.'/auth.php';
