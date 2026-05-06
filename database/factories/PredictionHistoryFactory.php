<?php

namespace Database\Factories;

use App\Models\InputLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PredictionHistory>
 */
class PredictionHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'project_id' => Project::factory(),
            'input_log_id' => InputLog::factory(),
            'estimasi_panen_ton' => fake()->randomFloat(2, 0.5, 20),
            'skor_kecocokan' => fake()->randomFloat(2, 45, 95),
            'status' => fake()->randomElement(['rendah', 'sedang', 'tinggi']),
            'faktor_dominan' => fake()->randomElement(['pH Tanah', 'Suhu', 'Curah Hujan']),
            'rekomendasi_json' => [
                'pupuk_disarankan' => 'NPK seimbang',
                'waktu_tanam_terbaik' => '1-2 minggu ke depan',
                'waktu_panen_prediksi' => now()->addDays(90)->translatedFormat('d F Y'),
                'tips_perawatan' => ['Monitoring mingguan'],
                'pengendalian_hama' => 'Inspeksi rutin',
                'catatan_risiko' => 'Risiko sedang',
            ],
            'lokasi' => fake()->city(),
            'tanggal_prediksi' => fake()->date(),
        ];
    }
}
