<?php

namespace App\Services;

use App\Models\InputLog;
use App\Models\Project;

class PredictionService
{
    /**
     * @var array<string, array{label:string, scale:float, weight:float}>
     */
    protected const FEATURE_SPECS = [
        'nitrogen' => ['label' => 'Nitrogen', 'scale' => 18.0, 'weight' => 1.0],
        'phosphorus' => ['label' => 'Fosfor', 'scale' => 16.0, 'weight' => 0.9],
        'potassium' => ['label' => 'Kalium', 'scale' => 16.0, 'weight' => 0.95],
        'ph_tanah' => ['label' => 'pH Tanah', 'scale' => 0.9, 'weight' => 1.25],
        'kelembapan_tanah' => ['label' => 'Kelembapan Tanah', 'scale' => 14.0, 'weight' => 1.1],
        'jumlah_air' => ['label' => 'Ketersediaan Air', 'scale' => 24.0, 'weight' => 1.05],
        'suhu' => ['label' => 'Suhu', 'scale' => 4.5, 'weight' => 1.1],
        'kelembapan_udara' => ['label' => 'Kelembapan Udara', 'scale' => 12.0, 'weight' => 0.85],
        'curah_hujan' => ['label' => 'Curah Hujan', 'scale' => 60.0, 'weight' => 1.0],
    ];

    public function __construct(
        protected AgronomicDatasetService $datasetService,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function predict(Project $project, InputLog $inputLog): array
    {
        return $this->predictScenario($project->jenis_tanaman, $project->luas_lahan, $this->extractFeatureVector($inputLog));
    }

    /**
     * @param  array<string, float>  $features
     * @return array<string, mixed>
     */
    public function predictScenario(
        string $jenisTanaman,
        float $luasLahan,
        array $features,
        bool $includeSimulation = true,
        ?string $excludeFingerprint = null,
    ): array {
        $profile = $this->datasetService->resolveCropProfile($jenisTanaman);

        return $this->predictFromVector(
            cropProfile: $profile,
            vector: $features,
            luasLahan: $luasLahan,
            includeSimulation: $includeSimulation,
            excludeFingerprint: $excludeFingerprint,
        );
    }

    /**
     * @param  array<string, mixed>  $cropProfile
     * @param  array<string, float>  $vector
     * @return array<string, mixed>
     */
    protected function predictFromVector(
        array $cropProfile,
        array $vector,
        float $luasLahan,
        bool $includeSimulation,
        ?string $excludeFingerprint = null,
    ): array
    {
        $neighbors = $this->nearestNeighbors((string) $cropProfile['key'], $vector, 7, $excludeFingerprint);
        $weightedYieldPerHa = $this->weightedAverage($neighbors, 'target_yield_per_ha');
        $predictedFactor = max(0.45, min(1.12, $weightedYieldPerHa / max(0.1, (float) $cropProfile['base_yield_per_ha'])));
        $componentScores = $this->componentScores($vector, $cropProfile);
        $skorKecocokan = round((collect($componentScores)->avg() * 0.65) + ($predictedFactor * 35), 2);
        $status = $predictedFactor >= 0.92 ? 'tinggi' : ($predictedFactor >= 0.76 ? 'sedang' : 'rendah');
        $penalties = $this->componentPenalties($componentScores);
        $faktorDominan = collect($componentScores)->sort()->keys()->first() ?? 'Kondisi lahan';
        $confidence = $this->confidenceScore($neighbors);
        $estimasiPanenTon = round(max(0.1, $luasLahan * $weightedYieldPerHa), 2);

        $result = [
            'estimasi_panen_ton' => $estimasiPanenTon,
            'skor_kecocokan' => $skorKecocokan,
            'status' => $status,
            'faktor_dominan' => $faktorDominan,
            'catatan_prediksi' => $this->buildNote($status, $estimasiPanenTon, $luasLahan, $confidence),
            'komponen_skor' => $componentScores,
            'confidence_score' => $confidence,
            'estimasi_per_hektare_ton' => round($weightedYieldPerHa, 2),
            'feature_importance' => $this->featureImportance($penalties),
            'ringkasan_model' => [
                'engine' => 'KNN agronomi',
                'crop_profile' => $cropProfile['label'],
                'neighbors_used' => count($neighbors),
                'confidence_label' => $confidence >= 82 ? 'tinggi' : ($confidence >= 68 ? 'sedang' : 'rendah'),
            ],
            'similar_cases' => $this->serializeNeighbors($neighbors),
        ];

        if ($includeSimulation) {
            $result['simulasi_perbaikan'] = $this->simulateImprovement($cropProfile, $vector, $luasLahan, $componentScores, $estimasiPanenTon);
        }

        return $result;
    }

    /**
     * @return array<string, float>
     */
    protected function extractFeatureVector(InputLog $inputLog): array
    {
        return [
            'nitrogen' => $inputLog->nitrogen,
            'phosphorus' => $inputLog->phosphorus,
            'potassium' => $inputLog->potassium,
            'ph_tanah' => $inputLog->ph_tanah,
            'kelembapan_tanah' => $inputLog->kelembapan_tanah,
            'jumlah_air' => $inputLog->jumlah_air,
            'suhu' => $inputLog->suhu,
            'kelembapan_udara' => $inputLog->kelembapan_udara,
            'curah_hujan' => $inputLog->curah_hujan,
        ];
    }

    /**
     * @param  array<string, float>  $vector
     * @return array<int, array<string, mixed>>
     */
    protected function nearestNeighbors(string $cropKey, array $vector, int $limit = 7, ?string $excludeFingerprint = null): array
    {
        $rows = collect($this->datasetService->benchmarkRows())
            ->filter(fn (array $row): bool => $row['crop_key'] === $cropKey)
            ->filter(fn (array $row): bool => $excludeFingerprint === null || $row['fingerprint'] !== $excludeFingerprint)
            ->values();

        if ($rows->isEmpty()) {
            $rows = collect($this->datasetService->benchmarkRows())
                ->filter(fn (array $row): bool => $row['crop_key'] === 'generic')
                ->filter(fn (array $row): bool => $excludeFingerprint === null || $row['fingerprint'] !== $excludeFingerprint)
                ->values();
        }

        return $rows
            ->map(function (array $row) use ($vector): array {
                $distance = $this->distance($vector, $row['features']);

                return [
                    ...$row,
                    'distance' => $distance,
                    'weight' => 1 / max(0.08, $distance),
                ];
            })
            ->sortBy('distance')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @param  array<string, float>  $input
     * @param  array<string, float>  $candidate
     */
    protected function distance(array $input, array $candidate): float
    {
        $sum = 0.0;

        foreach (self::FEATURE_SPECS as $feature => $spec) {
            $delta = (($input[$feature] ?? 0.0) - ($candidate[$feature] ?? 0.0)) / $spec['scale'];
            $sum += ($delta ** 2) * $spec['weight'];
        }

        return round(sqrt($sum), 4);
    }

    /**
     * @param  array<int, array<string, mixed>>  $neighbors
     */
    protected function weightedAverage(array $neighbors, string $targetKey): float
    {
        $totalWeight = max(0.0001, collect($neighbors)->sum('weight'));

        return round(
            collect($neighbors)->sum(fn (array $row): float => (float) $row[$targetKey] * (float) $row['weight']) / $totalWeight,
            4,
        );
    }

    /**
     * @param  array<string, float>  $vector
     * @param  array<string, mixed>  $cropProfile
     * @return array<string, float>
     */
    protected function componentScores(array $vector, array $cropProfile): array
    {
        $ideal = $cropProfile['ideal'];

        return [
            'pH Tanah' => $this->proximityScore($vector['ph_tanah'], (float) $ideal['ph_tanah'], 0.85),
            'Suhu' => $this->proximityScore($vector['suhu'], (float) $ideal['suhu'], 4.5),
            'Kelembapan Tanah' => $this->proximityScore($vector['kelembapan_tanah'], (float) $ideal['kelembapan_tanah'], 16.0),
            'Curah Hujan' => $this->proximityScore($vector['curah_hujan'], (float) $ideal['curah_hujan'], 65.0),
            'Keseimbangan NPK' => $this->npkBalanceScore($vector, $ideal),
            'Ketersediaan Air' => $this->proximityScore($vector['jumlah_air'], (float) $ideal['jumlah_air'], 28.0),
            'Kelembapan Udara' => $this->proximityScore($vector['kelembapan_udara'], (float) $ideal['kelembapan_udara'], 14.0),
        ];
    }

    protected function proximityScore(float $value, float $ideal, float $tolerance): float
    {
        $delta = abs($value - $ideal);
        $penalty = ($delta / max(0.1, $tolerance)) * 100;

        return round(max(8, 100 - $penalty), 2);
    }

    /**
     * @param  array<string, float>  $vector
     * @param  array<string, float>  $ideal
     */
    protected function npkBalanceScore(array $vector, array $ideal): float
    {
        $avgDelta = (
            abs($vector['nitrogen'] - $ideal['nitrogen']) +
            abs($vector['phosphorus'] - $ideal['phosphorus']) +
            abs($vector['potassium'] - $ideal['potassium'])
        ) / 3;

        return round(max(8, 100 - ($avgDelta * 1.45)), 2);
    }

    /**
     * @param  array<string, float>  $componentScores
     * @return array<string, float>
     */
    protected function componentPenalties(array $componentScores): array
    {
        return collect($componentScores)
            ->map(fn (float $score): float => round(max(1, 100 - $score), 2))
            ->all();
    }

    /**
     * @param  array<string, float>  $penalties
     * @return array<string, float>
     */
    protected function featureImportance(array $penalties): array
    {
        $total = max(0.001, array_sum($penalties));

        return collect($penalties)
            ->map(fn (float $penalty): float => round(($penalty / $total) * 100, 2))
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $neighbors
     * @return array<int, array<string, mixed>>
     */
    protected function serializeNeighbors(array $neighbors): array
    {
        return collect($neighbors)
            ->take(3)
            ->map(fn (array $row): array => [
                'crop' => $row['crop_label'],
                'scenario' => $row['scenario_label'],
                'yield_per_ha' => round((float) $row['target_yield_per_ha'], 2),
                'distance' => round((float) $row['distance'], 3),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $neighbors
     */
    protected function confidenceScore(array $neighbors): float
    {
        $meanDistance = max(0.05, collect($neighbors)->avg('distance') ?? 0.05);
        $score = 96 - ($meanDistance * 18.5);

        return round(max(44, min(96, $score)), 2);
    }

    protected function buildNote(string $status, float $estimasiPanenTon, float $luasLahan, float $confidence): string
    {
        $label = match ($status) {
            'tinggi' => 'Model melihat kondisi lahan dekat dengan pola benchmark terbaik.',
            'sedang' => 'Model menemukan potensi hasil cukup baik, tetapi masih ada variabel yang menahan performa.',
            default => 'Model mendeteksi beberapa indikator lahan cukup jauh dari pola benchmark yang sehat.',
        };

        return sprintf(
            '%s Estimasi panen %.2f ton dari luas %.2f ha dengan confidence %.0f%%.',
            $label,
            $estimasiPanenTon,
            $luasLahan,
            $confidence,
        );
    }

    /**
     * @param  array<string, mixed>  $cropProfile
     * @param  array<string, float>  $vector
     * @param  array<string, float>  $componentScores
     * @return array<string, mixed>
     */
    protected function simulateImprovement(
        array $cropProfile,
        array $vector,
        float $luasLahan,
        array $componentScores,
        float $currentEstimate,
    ): array {
        $dominant = collect($componentScores)->sort()->keys()->take(2)->values()->all();
        $improved = $vector;
        $ideal = $cropProfile['ideal'];

        foreach ($dominant as $factor) {
            match ($factor) {
                'pH Tanah' => $improved['ph_tanah'] = (float) $ideal['ph_tanah'],
                'Suhu' => $improved['suhu'] = (float) $ideal['suhu'],
                'Kelembapan Tanah' => $improved['kelembapan_tanah'] = (float) $ideal['kelembapan_tanah'],
                'Curah Hujan' => $improved['curah_hujan'] = (float) $ideal['curah_hujan'],
                'Keseimbangan NPK' => $improved['nitrogen'] = (float) $ideal['nitrogen'],
                'Ketersediaan Air' => $improved['jumlah_air'] = (float) $ideal['jumlah_air'],
                'Kelembapan Udara' => $improved['kelembapan_udara'] = (float) $ideal['kelembapan_udara'],
                default => null,
            };

            if ($factor === 'Keseimbangan NPK') {
                $improved['phosphorus'] = (float) $ideal['phosphorus'];
                $improved['potassium'] = (float) $ideal['potassium'];
            }
        }

        $recalculated = $this->predictFromVector($cropProfile, $improved, $luasLahan, false);

        return [
            'fokus_perbaikan' => $dominant,
            'estimasi_baru_ton' => $recalculated['estimasi_panen_ton'],
            'delta_ton' => round($recalculated['estimasi_panen_ton'] - $currentEstimate, 2),
            'skor_baru' => $recalculated['skor_kecocokan'],
        ];
    }
}
