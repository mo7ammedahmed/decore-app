<?php

namespace App\Policies;

use App\Models\TrackingIntegration;
use App\Models\User;

class TrackingIntegrationPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, ?TrackingIntegration $integration = null): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, ?TrackingIntegration $integration = null): bool
    {
        return $actor->isAdmin();
    }
}
