<?php

namespace App\Services;

use App\Models\InputLog;
use App\Models\Project;

class LegacyPredictionBaselineService
{
    /**
     * @return array<string, mixed>
     */
    public function predict(Project $project, InputLog $inputLog): array
    {
        return $this->predictScenario($project->jenis_tanaman, $project->luas_lahan, [
            'nitrogen' => $inputLog->nitrogen,
            'phosphorus' => $inputLog->phosphorus,
            'potassium' => $inputLog->potassium,
            'ph_tanah' => $inputLog->ph_tanah,
            'kelembapan_tanah' => $inputLog->kelembapan_tanah,
            'jumlah_air' => $inputLog->jumlah_air,
            'suhu' => $inputLog->suhu,
            'kelembapan_udara' => $inputLog->kelembapan_udara,
            'curah_hujan' => $inputLog->curah_hujan,
        ]);
    }

    /**
     * @param  array<string, float>  $features
     * @return array<string, mixed>
     */
    public function predictScenario(string $jenisTanaman, float $luasLahan, array $features): array
    {
        $scores = [
            'pH Tanah' => $this->rangeScore($features['ph_tanah'], 6.0, 7.5, 2.5),
            'Suhu' => $this->rangeScore($features['suhu'], 24, 32, 10),
            'Kelembapan Tanah' => $this->rangeScore($features['kelembapan_tanah'], 50, 80, 20),
            'Curah Hujan' => $this->rangeScore($features['curah_hujan'], 80, 220, 120),
            'Keseimbangan NPK' => $this->npkScore($features['nitrogen'], $features['phosphorus'], $features['potassium']),
            'Ketersediaan Air' => $this->rangeScore($features['jumlah_air'], 20, 120, 120),
            'Kelembapan Udara' => $this->rangeScore($features['kelembapan_udara'], 55, 85, 30),
        ];

        $score = round(collect($scores)->avg(), 2);
        $yieldPerHectare = $this->baselineYieldPerHectare($jenisTanaman);
        $modifier = max(0.4, min(1.2, $score / 85));
        $estimasiPanenTon = round($luasLahan * $yieldPerHectare * $modifier, 2);
        $status = $score >= 75 ? 'tinggi' : ($score >= 50 ? 'sedang' : 'rendah');
        $faktorDominan = collect($scores)->sort()->keys()->first() ?? 'Kondisi lahan';

        return [
            'estimasi_panen_ton' => $estimasiPanenTon,
            'skor_kecocokan' => $score,
            'status' => $status,
            'faktor_dominan' => $faktorDominan,
            'catatan_prediksi' => $this->buildNote($status, $estimasiPanenTon, $luasLahan),
            'komponen_skor' => $scores,
        ];
    }

    protected function baselineYieldPerHectare(string $jenisTanaman): float
    {
        $normalized = mb_strtolower(trim($jenisTanaman));

        return match (true) {
            str_contains($normalized, 'padi') => 5.8,
            str_contains($normalized, 'jagung') => 6.2,
            str_contains($normalized, 'kedelai') => 2.4,
            str_contains($normalized, 'cabai') => 8.5,
            str_contains($normalized, 'tomat') => 9.5,
            default => 4.8,
        };
    }

    protected function rangeScore(float $value, float $minIdeal, float $maxIdeal, float $tolerance): float
    {
        if ($value >= $minIdeal && $value <= $maxIdeal) {
            return 100;
        }

        $delta = $value < $minIdeal
            ? $minIdeal - $value
            : $value - $maxIdeal;

        $penalty = ($delta / max($tolerance, 0.1)) * 100;

        return round(max(10, 100 - $penalty), 2);
    }

    protected function npkScore(float $n, float $p, float $k): float
    {
        $ideal = 60.0;
        $avgDelta = (abs($n - $ideal) + abs($p - $ideal) + abs($k - $ideal)) / 3;

        return round(max(10, 100 - ($avgDelta * 1.2)), 2);
    }

    protected function buildNote(string $status, float $estimasiPanenTon, float $luasLahan): string
    {
        $label = match ($status) {
            'tinggi' => 'Kondisi lahan saat ini mendekati ideal.',
            'sedang' => 'Kondisi lahan cukup baik, masih ada ruang optimasi.',
            default => 'Kondisi lahan belum optimal dan perlu perbaikan prioritas.',
        };

        return sprintf(
            '%s Estimasi panen %.2f ton dari luas %.2f ha.',
            $label,
            $estimasiPanenTon,
            $luasLahan,
        );
    }
}
