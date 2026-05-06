<?php

namespace App\Services;

use App\Models\InputLog;
use App\Models\Project;

class PredictionService
{
    /**
     * @return array<string, mixed>
     */
    public function predict(Project $project, InputLog $inputLog): array
    {
        $scores = [
            'pH Tanah' => $this->rangeScore($inputLog->ph_tanah, 6.0, 7.5, 2.5),
            'Suhu' => $this->rangeScore($inputLog->suhu, 24, 32, 10),
            'Kelembapan Tanah' => $this->rangeScore($inputLog->kelembapan_tanah, 50, 80, 20),
            'Curah Hujan' => $this->rangeScore($inputLog->curah_hujan, 80, 220, 120),
            'Keseimbangan NPK' => $this->npkScore($inputLog->nitrogen, $inputLog->phosphorus, $inputLog->potassium),
            'Ketersediaan Air' => $this->rangeScore($inputLog->jumlah_air, 20, 120, 120),
            'Kelembapan Udara' => $this->rangeScore($inputLog->kelembapan_udara, 55, 85, 30),
        ];

        $score = round(collect($scores)->avg(), 2);

        $yieldPerHectare = $this->baselineYieldPerHectare($project->jenis_tanaman);
        $modifier = max(0.4, min(1.2, $score / 85));
        $estimasiPanenTon = round($project->luas_lahan * $yieldPerHectare * $modifier, 2);

        $status = $score >= 75 ? 'tinggi' : ($score >= 50 ? 'sedang' : 'rendah');

        $faktorDominan = collect($scores)->sort()->keys()->first() ?? 'Kondisi lahan';

        return [
            'estimasi_panen_ton' => $estimasiPanenTon,
            'skor_kecocokan' => $score,
            'status' => $status,
            'faktor_dominan' => $faktorDominan,
            'catatan_prediksi' => $this->buildNote($status, $estimasiPanenTon, $project->luas_lahan),
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
