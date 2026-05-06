<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'theme',
        'notification_enabled',
        'temperature_unit',
        'rainfall_unit',
        'yield_unit',
        'backup_enabled',
    ];

    protected function casts(): array
    {
        return [
            'notification_enabled' => 'boolean',
            'backup_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
