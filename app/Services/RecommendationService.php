<?php

namespace App\Services;

use App\Models\InputLog;
use App\Models\Project;

class RecommendationService
{
    /**
     * @param  array<string, mixed>  $prediction
     * @return array<string, mixed>
     */
    public function generate(Project $project, InputLog $inputLog, array $prediction): array
    {
        $tips = [];
        $risks = [];

        if ($inputLog->nitrogen < 45) {
            $tips[] = 'Tambahkan pupuk kaya nitrogen (misal urea) bertahap 1-2 kali aplikasi.';
        }

        if ($inputLog->phosphorus < 45) {
            $tips[] = 'Tambahkan pupuk kaya fosfor (misal SP-36/TSP) untuk mendukung perakaran dan pembungaan.';
        }

        if ($inputLog->potassium < 45) {
            $tips[] = 'Tambahkan pupuk kaya kalium (misal KCl) untuk memperkuat batang dan kualitas hasil panen.';
        }

        if ($inputLog->ph_tanah < 6.0) {
            $tips[] = 'Aplikasikan kapur pertanian (dolomit) untuk menaikkan pH tanah.';
            $risks[] = 'pH tanah terlalu asam dapat menurunkan serapan unsur hara.';
        } elseif ($inputLog->ph_tanah > 7.5) {
            $tips[] = 'Tambahkan bahan organik/kompos untuk menstabilkan pH tanah yang tinggi.';
            $risks[] = 'pH tanah terlalu basa berisiko mengikat unsur mikro.';
        }

        if ($inputLog->jumlah_air < 25) {
            $tips[] = 'Atur jadwal penyiraman rutin pagi/sore untuk menjaga kelembapan tanah.';
            $risks[] = 'Kekurangan air berisiko menghambat pertumbuhan vegetatif.';
        }

        if ($inputLog->curah_hujan > 220) {
            $tips[] = 'Perbaiki drainase lahan dan lakukan pencegahan jamur dengan monitoring ketat.';
            $risks[] = 'Curah hujan tinggi meningkatkan risiko penyakit jamur.';
        }

        if ($inputLog->suhu > 32) {
            $tips[] = 'Gunakan mulsa atau naungan parsial untuk mengurangi stres panas.';
            $risks[] = 'Suhu tinggi berpotensi menurunkan kualitas bunga/buah.';
        }

        if ($inputLog->kelembapan_udara > 85 || $inputLog->kelembapan_tanah > 85) {
            $tips[] = 'Tingkatkan sirkulasi udara dan lakukan pengendalian jamur/hama secara preventif.';
            $risks[] = 'Kelembapan tinggi meningkatkan risiko serangan penyakit tanaman.';
        }

        if (empty($tips)) {
            $tips[] = 'Pertahankan pola pemupukan dan irigasi saat ini, lalu lakukan monitoring mingguan.';
        }

        $waktuTanam = $inputLog->curah_hujan >= 80 && $inputLog->curah_hujan <= 200
            ? '1-2 minggu ke depan (kondisi cukup ideal)'
            : 'Tunggu stabilisasi cuaca 1 minggu sambil persiapan lahan';

        $hariPanen = match (true) {
            str_contains(mb_strtolower($project->jenis_tanaman), 'padi') => 115,
            str_contains(mb_strtolower($project->jenis_tanaman), 'jagung') => 95,
            str_contains(mb_strtolower($project->jenis_tanaman), 'kedelai') => 90,
            str_contains(mb_strtolower($project->jenis_tanaman), 'cabai') => 85,
            default => 100,
        };

        return [
            'pupuk_disarankan' => $inputLog->nitrogen < 45 || $inputLog->phosphorus < 45 || $inputLog->potassium < 45
                ? 'Pupuk makro spesifik (N/P/K) + NPK seimbang'
                : 'NPK seimbang + kompos organik',
            'waktu_tanam_terbaik' => $waktuTanam,
            'waktu_panen_prediksi' => now()->addDays($hariPanen)->translatedFormat('d F Y'),
            'tips_perawatan' => $tips,
            'pengendalian_hama' => 'Lakukan inspeksi daun 2x seminggu, gunakan perangkap hama, dan rotasi pestisida bila diperlukan.',
            'catatan_risiko' => empty($risks) ? 'Risiko utama relatif rendah, lanjutkan monitoring berkala.' : implode(' ', $risks),
            'ringkasan_status' => sprintf(
                'Skor %.2f dengan status %s. Prioritaskan perbaikan pada %s.',
                (float) ($prediction['skor_kecocokan'] ?? 0),
                (string) ($prediction['status'] ?? '-'),
                (string) ($prediction['faktor_dominan'] ?? 'kondisi lahan'),
            ),
        ];
    }
}
