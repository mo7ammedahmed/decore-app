<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function store(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, User $user): bool
    {
        return $actor->isAdmin() && $actor->id !== $user->id;
    }

    /**
     * Only admins may assign or change roles.
     */
    public function assignRole(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }
}
