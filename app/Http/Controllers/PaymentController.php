<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly PaymentService $payments) {}

    public function index(Invoice $invoice): Response
    {
        $this->authorize('viewAny', Payment::class);

        return Inertia::render('Payments/Index', [
            'invoice' => $invoice->load('customer:id,name'),
            'payments' => $invoice->payments()
                ->with('recorder:id,name')
                ->orderByDesc('paid_at')
                ->get(),
        ]);
    }

    public function create(Invoice $invoice): Response
    {
        $this->authorize('create', Payment::class, $invoice);

        return Inertia::render('Payments/Create', [
            'invoice' => $invoice->load('customer:id,name'),
            'paymentMethods' => PaymentMethod::cases(),
            'balanceDue' => $invoice->balance_due,
            'currency' => $invoice->currency_code,
        ]);
    }

    public function store(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        /*  $this->authorize('store', Payment::class, $invoice); */

        try {
            $this->payments->record($invoice, $request->validated(), $request->user());
        } catch (\DomainException $e) {
            return back()->with('error', $this->errorKey($e));
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'payment.recorded');
    }

    /**
     * Map a domain exception message to a translation key so the error toast
     * renders in the active locale. Unknown messages fall through raw — the
     * front-end translator returns the literal value for unknown keys.
     */
    private function errorKey(\DomainException $e): string
    {
        return match ($e->getMessage()) {
            'Payments cannot be recorded against cancelled invoices.' => 'payment.error_cancelled_invoice',
            'Payments can only be recorded against issued or completed invoices.' => 'payment.error_invalid_status',
            'Payment amounts must be greater than zero.' => 'payment.error_zero_amount',
            'This payment has already been reversed.' => 'payment.error_already_reversed',
            default => $e->getMessage(),
        };
    }

    public function reverse(Payment $payment): RedirectResponse
    {
        $this->authorize('reverse', $payment);

        try {
            $this->payments->reverse($payment, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $this->errorKey($e));
        }

        return redirect()
            ->route('invoices.show', $payment->invoice_id)
            ->with('success', 'payment.reversed');
    }
}
