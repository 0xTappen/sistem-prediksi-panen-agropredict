<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_tanaman',
        'jenis_tanaman',
        'luas_lahan',
        'lokasi',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'luas_lahan' => 'float',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inputLogs(): HasMany
    {
        return $this->hasMany(InputLog::class);
    }

    public function predictionHistories(): HasMany
    {
        return $this->hasMany(PredictionHistory::class);
    }
}
