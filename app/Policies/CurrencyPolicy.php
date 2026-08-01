<?php

namespace App\Policies;

use App\Models\Currency;
use App\Models\User;

class CurrencyPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function view(User $actor, Currency $currency): bool
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

    public function update(User $actor, Currency $currency): bool
    {
        return $actor->isAdmin();
    }
}
