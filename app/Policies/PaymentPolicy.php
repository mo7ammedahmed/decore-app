<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $actor, ?Invoice $invoice = null): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function view(User $actor, Payment $payment): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function create(User $actor, ?Invoice $invoice = null): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function store(User $actor, Invoice $invoice): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function reverse(User $actor, Payment $payment): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true)
            && $payment->reversed_at === null;
    }
}
