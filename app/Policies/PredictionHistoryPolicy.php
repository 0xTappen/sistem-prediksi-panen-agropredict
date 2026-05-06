<?php

namespace App\Policies;

use App\Models\PredictionHistory;
use App\Models\User;

class PredictionHistoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    public function view(User $user, PredictionHistory $predictionHistory): bool
    {
        return $user->id === $predictionHistory->user_id;
    }

    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function delete(User $user, PredictionHistory $predictionHistory): bool
    {
        return $user->id === $predictionHistory->user_id;
    }
}
