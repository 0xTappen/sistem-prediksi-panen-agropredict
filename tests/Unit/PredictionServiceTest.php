<?php

use App\Models\InputLog;
use App\Models\Project;
use App\Models\User;
use App\Services\PredictionService;

it('PredictionService menghasilkan estimasi', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $user->id,
        'jenis_tanaman' => 'Padi',
        'luas_lahan' => 2.0,
    ]);

    $inputLog = InputLog::factory()->create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'ph_tanah' => 6.8,
        'suhu' => 29,
        'kelembapan_tanah' => 72,
        'curah_hujan' => 130,
    ]);

    $service = app(PredictionService::class);
    $result = $service->predict($project, $inputLog);

    expect($result)
        ->toHaveKeys([
            'estimasi_panen_ton',
            'skor_kecocokan',
            'status',
            'faktor_dominan',
            'catatan_prediksi',
            'komponen_skor',
        ]);

    expect($result['estimasi_panen_ton'])->toBeFloat();
    expect($result['skor_kecocokan'])->toBeFloat();
});
