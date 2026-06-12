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
            'confidence_score',
            'estimasi_per_hektare_ton',
            'feature_importance',
            'ringkasan_model',
            'similar_cases',
            'simulasi_perbaikan',
        ]);

    expect($result['estimasi_panen_ton'])->toBeFloat();
    expect($result['skor_kecocokan'])->toBeFloat();
    expect($result['confidence_score'])->toBeFloat();
    expect($result['similar_cases'])->toBeArray();
});

it('PredictionService memberi estimasi lebih baik untuk kondisi lahan yang lebih sehat', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $user->id,
        'jenis_tanaman' => 'Jagung',
        'luas_lahan' => 2.0,
    ]);

    $service = app(PredictionService::class);

    $healthy = InputLog::factory()->make([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'nitrogen' => 68,
        'phosphorus' => 56,
        'potassium' => 61,
        'ph_tanah' => 6.4,
        'kelembapan_tanah' => 67,
        'jumlah_air' => 76,
        'suhu' => 29,
        'kelembapan_udara' => 71,
        'curah_hujan' => 135,
    ]);

    $stressed = InputLog::factory()->make([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'nitrogen' => 28,
        'phosphorus' => 30,
        'potassium' => 32,
        'ph_tanah' => 5.1,
        'kelembapan_tanah' => 42,
        'jumlah_air' => 22,
        'suhu' => 35,
        'kelembapan_udara' => 54,
        'curah_hujan' => 52,
    ]);

    $healthyResult = $service->predict($project, $healthy);
    $stressedResult = $service->predict($project, $stressed);

    expect($healthyResult['estimasi_panen_ton'])->toBeGreaterThan($stressedResult['estimasi_panen_ton']);
    expect($healthyResult['skor_kecocokan'])->toBeGreaterThan($stressedResult['skor_kecocokan']);
});
