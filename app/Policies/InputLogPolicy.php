<?php

namespace App\Policies;

use App\Models\InputLog;
use App\Models\User;

class InputLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    public function view(User $user, InputLog $inputLog): bool
    {
        return $user->id === $inputLog->user_id;
    }

    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function delete(User $user, InputLog $inputLog): bool
    {
        return $user->id === $inputLog->user_id;
    }
}
