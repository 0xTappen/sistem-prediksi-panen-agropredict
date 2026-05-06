<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InputLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'nitrogen',
        'phosphorus',
        'potassium',
        'ph_tanah',
        'kelembapan_tanah',
        'jumlah_air',
        'suhu',
        'kelembapan_udara',
        'curah_hujan',
        'sumber_cuaca',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'nitrogen' => 'float',
            'phosphorus' => 'float',
            'potassium' => 'float',
            'ph_tanah' => 'float',
            'kelembapan_tanah' => 'float',
            'jumlah_air' => 'float',
            'suhu' => 'float',
            'kelembapan_udara' => 'float',
            'curah_hujan' => 'float',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function predictionHistory(): HasOne
    {
        return $this->hasOne(PredictionHistory::class);
    }
}
