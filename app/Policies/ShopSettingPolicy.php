<?php

namespace App\Policies;

use App\Models\ShopSetting;
use App\Models\User;

class ShopSettingPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, ?ShopSetting $setting = null): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, ?ShopSetting $setting = null): bool
    {
        return $actor->isAdmin();
    }
}
