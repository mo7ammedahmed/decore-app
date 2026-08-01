<?php

namespace App\Policies;

use App\Models\ExchangeRate;
use App\Models\User;

class ExchangeRatePolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant'], true);
    }

    public function view(User $actor, ExchangeRate $exchangeRate): bool
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

    public function delete(User $actor, ExchangeRate $exchangeRate): bool
    {
        return $actor->isAdmin();
    }
}
