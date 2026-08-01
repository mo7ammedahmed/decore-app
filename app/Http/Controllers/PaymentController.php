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
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Payment recorded successfully.');
    }

    public function reverse(Payment $payment): RedirectResponse
    {
        $this->authorize('reverse', $payment);

        try {
            $this->payments->reverse($payment, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.show', $payment->invoice_id)
            ->with('success', 'Payment reversed. The financial record is preserved.');
    }
}
