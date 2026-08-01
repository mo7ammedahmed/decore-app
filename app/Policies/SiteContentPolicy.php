<?php

namespace App\Policies;

use App\Models\SiteContent;
use App\Models\User;

class SiteContentPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, ?SiteContent $content = null): bool
    {
        return $actor->isAdmin();
    }
}
