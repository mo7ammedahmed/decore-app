<?php

namespace App\Policies;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function view(User $actor, Invoice $invoice): bool
    {
        if ($actor->isSalesStaff()) {
            return (int) $invoice->created_by === (int) $actor->id;
        }

        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function store(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function update(User $actor, Invoice $invoice): bool
    {
        // Only draft invoices may be edited.
        if ($invoice->status !== InvoiceStatus::Draft) {
            return false;
        }

        if ($actor->isSalesStaff()) {
            return (int) $invoice->created_by === (int) $actor->id;
        }

        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function delete(User $actor, Invoice $invoice): bool
    {
        if ($invoice->status !== InvoiceStatus::Draft) {
            return false;
        }

        if ($actor->isSalesStaff()) {
            return (int) $invoice->created_by === (int) $actor->id;
        }

        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function issue(User $actor, Invoice $invoice): bool
    {
        return $invoice->status === InvoiceStatus::Draft
            && in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function complete(User $actor, Invoice $invoice): bool
    {
        return $invoice->status === InvoiceStatus::Issued
            && in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function cancel(User $actor, Invoice $invoice): bool
    {
        return in_array($invoice->status, [InvoiceStatus::Draft, InvoiceStatus::Issued], true)
            && in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function print(User $actor, Invoice $invoice): bool
    {
        return $this->view($actor, $invoice);
    }
}
