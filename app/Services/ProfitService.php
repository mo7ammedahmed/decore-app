<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Support\Money;

class ProfitService
{
    /**
     * Per-line profit summary based on the stored cost snapshot.
     *
     * @return array{gross_profit: string, margin: string, revenue: string, cost: string}
     */
    public function forItem(InvoiceItem $item): array
    {
        $revenue = $item->revenueBeforeTax();
        $cost = $item->totalSupplierCost();
        $gross = Money::sub($revenue, $cost);
        $margin = (float) $revenue > 0 ? Money::div(Money::mul($gross, '100'), $revenue) : '0.00';

        return [
            'gross_profit' => $gross,
            'margin' => $margin,
            'revenue' => $revenue,
            'cost' => $cost,
        ];
    }

    /**
     * Invoice-level profit summary (base currency).
     *
     * @return array{gross_profit: string, margin: string, revenue: string, cost: string}
     */
    /**
     * Revenue contribution of one item in base currency, after line discounts.
     */
    protected function itemBaseRevenue(InvoiceItem $item): string
    {
        $gross = Money::mul($item->base_unit_price, $item->quantity);
        $discount = Money::mul($item->discount_amount, $item->invoice->exchange_rate);

        return Money::sub($gross, $discount);
    }

    public function forInvoice(Invoice $invoice): array
    {
        $revenue = '0.00';
        $cost = '0.00';

        foreach ($invoice->items as $item) {
            $revenue = Money::add($revenue, $this->itemBaseRevenue($item));
            $cost = Money::add($cost, Money::mul($item->base_unit_cost, $item->quantity));
        }

        $gross = Money::sub($revenue, $cost);
        $margin = (float) $revenue > 0 ? Money::div(Money::mul($gross, '100'), $revenue) : '0.00';

        return [
            'gross_profit' => $gross,
            'margin' => $margin,
            'revenue' => $revenue,
            'cost' => $cost,
        ];
    }

    /**
     * Aggregate profit across a collection of finalized invoices.
     *
     * @param  iterable<Invoice>  $invoices
     * @return array{gross_profit: string, margin: string, revenue: string, cost: string}
     */
    public function aggregate(iterable $invoices): array
    {
        $revenue = '0.00';
        $cost = '0.00';

        foreach ($invoices as $invoice) {
            foreach ($invoice->items as $item) {
                $revenue = Money::add($revenue, $this->itemBaseRevenue($item));
                $cost = Money::add($cost, Money::mul($item->base_unit_cost, $item->quantity));
            }
        }

        $gross = Money::sub($revenue, $cost);
        $margin = (float) $revenue > 0 ? Money::div(Money::mul($gross, '100'), $revenue) : '0.00';

        return [
            'gross_profit' => $gross,
            'margin' => $margin,
            'revenue' => $revenue,
            'cost' => $cost,
        ];
    }
}
