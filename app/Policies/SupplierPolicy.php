<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function viewAny(User $actor): bool
    {
        // Suppliers may browse the list but are scoped to their own record.
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff', 'supplier'], true);
    }

    public function view(User $actor, Supplier $supplier): bool
    {
        if ($actor->isSupplier()) {
            return (int) $actor->supplier_id === (int) $supplier->id;
        }

        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff'], true);
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function store(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, Supplier $supplier): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, Supplier $supplier): bool
    {
        return $actor->isAdmin();
    }
}
