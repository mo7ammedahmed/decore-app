<?php

namespace App\Policies;

use App\Models\GallerySection;
use App\Models\User;

class GallerySectionPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, GallerySection $section): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, GallerySection $section): bool
    {
        return $actor->isAdmin();
    }
}
