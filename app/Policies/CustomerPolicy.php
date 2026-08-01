<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function view(User $actor, Customer $customer): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'sales_staff'], true);
    }

    public function store(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'sales_staff'], true);
    }

    public function update(User $actor, Customer $customer): bool
    {
        return in_array($actor->role->value, ['admin', 'sales_staff'], true);
    }

    public function delete(User $actor, Customer $customer): bool
    {
        return $actor->isAdmin();
    }
}
