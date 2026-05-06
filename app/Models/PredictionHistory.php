<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PredictionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'input_log_id',
        'estimasi_panen_ton',
        'skor_kecocokan',
        'status',
        'faktor_dominan',
        'rekomendasi_json',
        'lokasi',
        'tanggal_prediksi',
    ];

    protected function casts(): array
    {
        return [
            'estimasi_panen_ton' => 'float',
            'skor_kecocokan' => 'float',
            'tanggal_prediksi' => 'date',
            'rekomendasi_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function inputLog(): BelongsTo
    {
        return $this->belongsTo(InputLog::class);
    }
}
