<?php

namespace App\Services;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Material;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(
        private readonly CurrencyService $currencies,
        private readonly CostHistoryService $costHistory,
    ) {
    }

    /**
     * Generate the next sequential invoice number, e.g. INV-2026-000042.
     */
    public function generateNumber(): string
    {
        $prefix = 'INV-'.now()->format('Y').'-';

        $last = Invoice::withTrashed()
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $sequence = $last !== null ? ((int) mb_substr($last, -6)) + 1 : 1;

        return $prefix.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create an invoice with line items inside a single transaction.
     * All totals are computed on the server; client values are never trusted.
     *
     * @param  array<string, mixed>  $attributes  customer_id, issue_date, due_date, currency_code, discount_type, discount_value, notes
     * @param  array<int, array<string, mixed>>  $items
     */
    public function create(array $attributes, array $items, User $user): Invoice
    {
        // Sales staff must never influence supplier cost snapshots.
        if (! $user->role->canManageCosts()) {
            foreach ($items as &$item) {
                unset($item['unit_cost']);
            }
            unset($item);
        }

        return DB::transaction(function () use ($attributes, $items, $user) {
            $issueDate = (string) $attributes['issue_date'];
            $currency = $attributes['currency_code'];
            $base = $this->currencies->baseCode();
            $rate = $this->currencies->rateFor($currency, $issueDate, $base);

            $invoice = Invoice::create([
                'invoice_number' => $this->generateNumber(),
                'customer_id' => $attributes['customer_id'],
                'created_by' => $user->id,
                'issue_date' => $issueDate,
                'due_date' => $attributes['due_date'] ?? null,
                'status' => InvoiceStatus::Draft->value,
                'payment_status' => PaymentStatus::Unpaid->value,
                'currency_code' => $currency,
                'base_currency_code' => $base,
                'exchange_rate' => $rate,
                'subtotal' => 0,
                'discount_type' => $attributes['discount_type'] ?? DiscountType::None->value,
                'discount_value' => $attributes['discount_value'] ?? 0,
                'discount_total' => 0,
                'tax_total' => 0,
                'total' => 0,
                'base_subtotal' => 0,
                'base_tax_total' => 0,
                'base_total' => 0,
                'paid_total' => 0,
                'balance_due' => 0,
                'notes' => $attributes['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $this->createItem($invoice, $item, $rate, $issueDate);
            }

            $this->recalculate($invoice);

            AuditService::log('invoice.created', $invoice, null, [
                'number' => $invoice->invoice_number,
                'total' => $invoice->total,
                'currency' => $invoice->currency_code,
            ], $user->id);

            return $invoice->load('items');
        });
    }

    /**
     * Replace the line items of a draft invoice and recalculate totals.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function update(Invoice $invoice, array $attributes, array $items, User $user): Invoice
    {
        // Only draft invoices may be edited — issued financial records are frozen.
        if ($invoice->status !== InvoiceStatus::Draft) {
            throw new \DomainException('Only draft invoices can be edited.');
        }

        // Sales staff must never influence supplier cost snapshots.
        if (! $user->role->canManageCosts()) {
            foreach ($items as &$item) {
                unset($item['unit_cost']);
            }
            unset($item);
        }

        return DB::transaction(function () use ($invoice, $attributes, $items, $user) {
            $invoice->update([
                'customer_id' => $attributes['customer_id'],
                'issue_date' => $attributes['issue_date'],
                'due_date' => $attributes['due_date'] ?? null,
                'discount_type' => $attributes['discount_type'] ?? DiscountType::None->value,
                'discount_value' => $attributes['discount_value'] ?? 0,
                'notes' => $attributes['notes'] ?? null,
            ]);

            $invoice->items()->delete();

            // Drafts may change their issue date, so re-derive the exchange
            // rate for the base-currency snapshot (issued invoices are frozen).
            $issueDate = (string) $attributes['issue_date'];
            $rate = $this->currencies->rateFor(
                $invoice->currency_code,
                $issueDate,
                $invoice->base_currency_code
            );
            $invoice->forceFill(['exchange_rate' => $rate])->save();

            foreach ($items as $item) {
                $this->createItem($invoice, $item, $rate, $issueDate);
            }

            $this->recalculate($invoice);

            AuditService::log('invoice.updated', $invoice, null, ['number' => $invoice->invoice_number], $user->id);

            return $invoice->load('items');
        });
    }

    /**
     * Persist a single validated line item with historical snapshots.
     *
     * @param  array<string, mixed>  $item
     */
    protected function createItem(Invoice $invoice, array $item, string $rate, string $issueDate): InvoiceItem
    {
        $material = Material::query()
            ->with(['supplier', 'classification'])
            ->findOrFail($item['material_id']);

        $quantity = Money::round($item['quantity']);
        $unitPrice = isset($item['unit_price']) && $item['unit_price'] !== ''
            ? Money::round($item['unit_price'])
            : Money::round($material->selling_price);
        $unitCost = isset($item['unit_cost']) && $item['unit_cost'] !== ''
            ? Money::round($item['unit_cost'])
            : ($this->costHistory->costAt($material, $issueDate) ?? Money::round($material->default_supplier_cost));
        $discount = $item['discount_amount'] ?? 0;
        $taxRate = $item['tax_rate'] ?? 0;

        $lineSubtotal = Money::mul($quantity, $unitPrice);
        $taxAmount = Money::mul(Money::sub($lineSubtotal, $discount), Money::div($taxRate, '100'));
        $lineTotal = Money::add(Money::sub($lineSubtotal, $discount), $taxAmount);

        $description = $item['description'] ?? trim($material->name_en);

        return $invoice->items()->create([
            'material_id' => $material->id,
            'supplier_id' => $material->supplier_id,
            'classification_id' => $material->classification_id,
            'description' => $description,
            'quantity' => $quantity,
            'unit' => $material->unit->value,
            'unit_price' => $unitPrice,
            'unit_cost' => $unitCost,
            'discount_amount' => Money::round($discount),
            'tax_rate' => Money::round($taxRate, 3),
            'tax_amount' => $taxAmount,
            'line_subtotal' => $lineSubtotal,
            'line_total' => $lineTotal,
            'base_unit_price' => Money::mul($unitPrice, $rate),
            'base_unit_cost' => Money::mul($unitCost, $rate),
            'base_line_total' => Money::mul($lineTotal, $rate),
        ]);
    }

    /**
     * Recalculate every invoice total from stored line items. The server is
     * always the source of truth for financial amounts.
     */
    public function recalculate(Invoice $invoice): Invoice
    {
        $items = $invoice->items()->get();

        $subtotal = '0.00';
        $taxTotal = '0.00';
        $lineDiscounts = '0.00';

        foreach ($items as $item) {
            $subtotal = Money::add($subtotal, $item->line_subtotal);
            $taxTotal = Money::add($taxTotal, $item->tax_amount);
            $lineDiscounts = Money::add($lineDiscounts, $item->discount_amount);
        }

        // Invoice-level discount (percentage of subtotal, or fixed amount).
        $invoiceDiscount = match ($invoice->discount_type) {
            DiscountType::Percentage => Money::mul($subtotal, Money::div($invoice->discount_value, '100')),
            DiscountType::Fixed => Money::round($invoice->discount_value),
            default => '0.00',
        };

        if (Money::gt($invoiceDiscount, $subtotal)) {
            $invoiceDiscount = $subtotal;
        }

        $discountTotal = Money::add($lineDiscounts, $invoiceDiscount);
        $total = Money::add(Money::sub($subtotal, $discountTotal), $taxTotal);

        $paidTotal = $this->paidTotal($invoice);

        $invoice->forceFill([
            'subtotal' => $subtotal,
            'discount_total' => $discountTotal,
            'tax_total' => $taxTotal,
            'total' => $total,
            'base_subtotal' => Money::mul($subtotal, $invoice->exchange_rate),
            'base_tax_total' => Money::mul($taxTotal, $invoice->exchange_rate),
            'base_total' => Money::mul($total, $invoice->exchange_rate),
            'paid_total' => $paidTotal,
            'balance_due' => Money::sub($total, $paidTotal),
        ])->save();

        $this->refreshPaymentStatus($invoice);

        return $invoice;
    }

    /**
     * Sum of active payments for an invoice, in the invoice currency.
     */
    protected function paidTotal(Invoice $invoice): string
    {
        $total = '0.00';

        foreach ($invoice->payments()->whereNull('reversed_at')->get(['amount']) as $payment) {
            $total = Money::add($total, $payment->amount);
        }

        return $total;
    }

    /**
     * Derive the payment status from paid total vs invoice total.
     */
    public function refreshPaymentStatus(Invoice $invoice): Invoice
    {
        $status = match (true) {
            Money::gt($invoice->paid_total, $invoice->total) => PaymentStatus::Overpaid,
            Money::gte($invoice->paid_total, $invoice->total) && Money::gt($invoice->total, 0) => PaymentStatus::Paid,
            Money::gt($invoice->paid_total, 0) => PaymentStatus::Partial,
            default => PaymentStatus::Unpaid,
        };

        $invoice->forceFill(['payment_status' => $status->value])->save();

        return $invoice;
    }

    public function issue(Invoice $invoice, User $user): Invoice
    {
        return DB::transaction(function () use ($invoice, $user) {
            if ($invoice->status !== InvoiceStatus::Draft) {
                throw new \DomainException('Only draft invoices can be issued.');
            }

            $invoice->forceFill(['status' => InvoiceStatus::Issued->value])->save();

            AuditService::log('invoice.issued', $invoice, ['status' => 'draft'], ['status' => 'issued'], $user->id);

            return $invoice;
        });
    }

    public function complete(Invoice $invoice, User $user): Invoice
    {
        return DB::transaction(function () use ($invoice, $user) {
            if ($invoice->status !== InvoiceStatus::Issued) {
                throw new \DomainException('Only issued invoices can be completed.');
            }

            $invoice->forceFill(['status' => InvoiceStatus::Completed->value])->save();

            AuditService::log('invoice.completed', $invoice, ['status' => 'issued'], ['status' => 'completed'], $user->id);

            return $invoice;
        });
    }

    public function cancel(Invoice $invoice, User $user): Invoice
    {
        return DB::transaction(function () use ($invoice, $user) {
            if (! in_array($invoice->status, [InvoiceStatus::Draft, InvoiceStatus::Issued], true)) {
                throw new \DomainException('This invoice cannot be cancelled.');
            }

            $invoice->forceFill(['status' => InvoiceStatus::Cancelled->value])->save();

            AuditService::log('invoice.cancelled', $invoice, ['status' => 'active'], ['status' => 'cancelled'], $user->id);

            return $invoice;
        });
    }

    /**
     * Hard-delete a draft invoice (line items cascade). Other statuses are
     * preserved as financial records.
     */
    public function deleteDraft(Invoice $invoice, User $user): void
    {
        if ($invoice->status !== InvoiceStatus::Draft) {
            throw new \DomainException('Only draft invoices can be deleted. Issued financial records are preserved.');
        }

        DB::transaction(function () use ($invoice, $user): void {
            $number = $invoice->invoice_number;
            AuditService::log('invoice.deleted', $invoice, ['number' => $number], null, $user->id);
            $invoice->forceDelete();
        });
    }
}
