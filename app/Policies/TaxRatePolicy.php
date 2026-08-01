<?php

namespace App\Policies;

use App\Models\TaxRate;
use App\Models\User;

class TaxRatePolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function view(User $actor, TaxRate $taxRate): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function store(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, TaxRate $taxRate): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, TaxRate $taxRate): bool
    {
        return $actor->isAdmin();
    }
}
