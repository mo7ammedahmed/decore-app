<?php

namespace App\Policies;

use App\Models\Classification;
use App\Models\User;

class ClassificationPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff', 'supplier'], true);
    }

    public function view(User $actor, Classification $classification): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff', 'supplier'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function store(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, Classification $classification): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, Classification $classification): bool
    {
        return $actor->isAdmin();
    }
}
