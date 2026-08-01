<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    public function viewAny(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'accountant', 'sales_staff', 'supplier'], true);
    }

    public function view(User $actor, Material $material): bool
    {
        if ($actor->isSupplier()) {
            return (int) $actor->supplier_id === (int) $material->supplier_id;
        }

        return true;
    }

    public function create(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'supplier'], true);
    }

    public function store(User $actor): bool
    {
        return in_array($actor->role->value, ['admin', 'supplier'], true);
    }

    public function update(User $actor, Material $material): bool
    {
        if ($actor->isSupplier()) {
            return (int) $actor->supplier_id === (int) $material->supplier_id;
        }

        return $actor->isAdmin();
    }

    public function delete(User $actor, Material $material): bool
    {
        if ($actor->isSupplier()) {
            return (int) $actor->supplier_id === (int) $material->supplier_id;
        }

        return $actor->isAdmin();
    }

    /**
     * Product image management mirrors material ownership — the supplier may
     * only manage images for their own materials.
     */
    public function manageImage(User $actor, Material $material): bool
    {
        if ($actor->isSupplier()) {
            return (int) $actor->supplier_id === (int) $material->supplier_id;
        }

        return $actor->isAdmin();
    }
}
