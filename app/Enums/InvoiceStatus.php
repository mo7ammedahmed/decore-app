<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Issued => 'Issued',
            self::Cancelled => 'Cancelled',
            self::Completed => 'Completed',
        };
    }

    /**
     * Statuses that represent finalised, financially relevant invoices.
     */
    public function isFinalized(): bool
    {
        return in_array($this, [self::Issued, self::Completed], true);
    }

    /**
     * Whether the invoice can still be edited (line items / amounts).
     */
    public function isEditable(): bool
    {
        return $this === self::Draft;
    }

    /**
     * Whether payments may be recorded against this invoice.
     */
    public function acceptsPayments(): bool
    {
        return in_array($this, [self::Issued, self::Completed], true);
    }
}
