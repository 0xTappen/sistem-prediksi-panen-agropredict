<?php

use App\Models\InputLog;
use App\Models\Project;
use App\Models\User;
use App\Services\PredictionService;
use App\Services\RecommendationService;

it('RecommendationService menghasilkan rekomendasi', function () {
    $user = User::factory()->create();

    $project = Project::factory()->create([
        'user_id' => $user->id,
        'jenis_tanaman' => 'Padi',
    ]);

    $inputLog = InputLog::factory()->create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'nitrogen' => 30,
        'ph_tanah' => 5.1,
        'jumlah_air' => 15,
        'curah_hujan' => 250,
        'suhu' => 35,
    ]);

    $prediction = app(PredictionService::class)->predict($project, $inputLog);
    $recommendation = app(RecommendationService::class)->generate($project, $inputLog, $prediction);

    expect($recommendation)->toHaveKeys([
        'pupuk_disarankan',
        'waktu_tanam_terbaik',
        'waktu_panen_prediksi',
        'tips_perawatan',
        'pengendalian_hama',
        'catatan_risiko',
        'ringkasan_status',
    ]);

    expect($recommendation['tips_perawatan'])->toBeArray();
    expect($recommendation['pupuk_disarankan'])->toBeString();
});
