<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly InvoiceService $invoices,
        private readonly CurrencyService $currencies,
    ) {}

    /**
     * Generate the next sequential payment number, e.g. PAY-2026-000013.
     */
    public function generateNumber(): string
    {
        $prefix = 'PAY-'.now()->format('Y').'-';

        $last = Payment::withTrashed()
            ->where('payment_number', 'like', $prefix.'%')
            ->orderByDesc('payment_number')
            ->value('payment_number');

        $sequence = $last !== null ? ((int) mb_substr($last, -6)) + 1 : 1;

        return $prefix.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Record a payment against an issued/completed invoice. The invoice row is
     * locked to prevent concurrent double-spend style races.
     */
    public function record(Invoice $invoice, array $attributes, User $user): Payment
    {
        return DB::transaction(function () use ($invoice, $attributes, $user) {
            /** @var Invoice $locked */
            $locked = Invoice::query()->lockForUpdate()->findOrFail($invoice->id);

            if ($locked->status === InvoiceStatus::Cancelled) {
                throw new \DomainException('Payments cannot be recorded against cancelled invoices.');
            }

            if (! $locked->status->acceptsPayments()) {
                throw new \DomainException('Payments can only be recorded against issued or completed invoices.');
            }

            $amount = Money::round($attributes['amount']);

            if (Money::lt($amount, '0.01')) {
                throw new \DomainException('Payment amounts must be greater than zero.');
            }

            $payment = Payment::create([
                'invoice_id' => $locked->id,
                'recorded_by' => $user->id,
                'payment_number' => $this->generateNumber(),
                'amount' => $amount,
                'currency_code' => $locked->currency_code,
                'exchange_rate' => $locked->exchange_rate,
                'base_amount' => Money::mul($amount, $locked->exchange_rate),
                'payment_method' => $attributes['payment_method'],
                'paid_at' => $attributes['paid_at'],
                'reference' => $attributes['reference'] ?? null,
                'notes' => $attributes['notes'] ?? null,
            ]);

            $this->invoices->recalculate($locked);

            AuditService::log('payment.created', $payment, null, [
                'invoice' => $locked->invoice_number,
                'amount' => $payment->amount,
            ], $user->id);

            return $payment;
        });
    }

    /**
     * Reverse a payment (void). The financial record is preserved.
     */
    public function reverse(Payment $payment, User $user): Payment
    {
        return DB::transaction(function () use ($payment, $user) {
            /** @var Payment $locked */
            $locked = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            if ($locked->reversed_at !== null) {
                throw new \DomainException('This payment has already been reversed.');
            }

            $locked->update([
                'reversed_at' => now(),
                'reversed_by' => $user->id,
            ]);

            $this->invoices->recalculate($locked->invoice);

            AuditService::log('payment.reversed', $locked, ['amount' => $locked->amount], ['reversed' => true], $user->id);

            return $locked;
        });
    }
}
