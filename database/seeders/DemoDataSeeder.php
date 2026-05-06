<?php

namespace Database\Seeders;

use App\Models\InputLog;
use App\Models\PredictionHistory;
use App\Models\Project;
use App\Models\User;
use App\Models\UserSetting;
use App\Services\PredictionService;
use App\Services\RecommendationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $predictionService = app(PredictionService::class);
        $recommendationService = app(RecommendationService::class);

        $user = User::query()->updateOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo Petani',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        UserSetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => 'light',
                'notification_enabled' => true,
                'temperature_unit' => 'celsius',
                'rainfall_unit' => 'mm',
                'yield_unit' => 'ton',
                'backup_enabled' => false,
            ],
        );

        $projects = collect([
            ['nama_tanaman' => 'Padi Ciherang', 'jenis_tanaman' => 'Padi', 'luas_lahan' => 2.5, 'lokasi' => 'Karawang'],
            ['nama_tanaman' => 'Jagung Hibrida', 'jenis_tanaman' => 'Jagung', 'luas_lahan' => 1.8, 'lokasi' => 'Lampung'],
            ['nama_tanaman' => 'Cabai Merah', 'jenis_tanaman' => 'Cabai', 'luas_lahan' => 0.9, 'lokasi' => 'Bandung'],
        ])->map(fn (array $projectData): Project => Project::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'nama_tanaman' => $projectData['nama_tanaman'],
            ],
            [
                ...$projectData,
                'latitude' => null,
                'longitude' => null,
            ],
        ));

        foreach ($projects as $project) {
            for ($i = 0; $i < 2; $i++) {
                $inputLog = InputLog::query()->create([
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                    'nitrogen' => fake()->randomFloat(2, 35, 85),
                    'phosphorus' => fake()->randomFloat(2, 35, 85),
                    'potassium' => fake()->randomFloat(2, 35, 85),
                    'ph_tanah' => fake()->randomFloat(2, 5.2, 7.8),
                    'kelembapan_tanah' => fake()->randomFloat(2, 45, 85),
                    'jumlah_air' => fake()->randomFloat(2, 20, 120),
                    'suhu' => fake()->randomFloat(2, 23, 34),
                    'kelembapan_udara' => fake()->randomFloat(2, 55, 88),
                    'curah_hujan' => fake()->randomFloat(2, 40, 250),
                    'sumber_cuaca' => fake()->randomElement(['api', 'manual']),
                    'catatan' => 'Data demo #'.($i + 1),
                    'created_at' => now()->subDays(10 - ($i * 3)),
                    'updated_at' => now()->subDays(10 - ($i * 3)),
                ]);

                $prediction = $predictionService->predict($project, $inputLog);
                $recommendation = $recommendationService->generate($project, $inputLog, $prediction);

                PredictionHistory::query()->create([
                    'user_id' => $user->id,
                    'project_id' => $project->id,
                    'input_log_id' => $inputLog->id,
                    'estimasi_panen_ton' => $prediction['estimasi_panen_ton'],
                    'skor_kecocokan' => $prediction['skor_kecocokan'],
                    'status' => $prediction['status'],
                    'faktor_dominan' => $prediction['faktor_dominan'],
                    'rekomendasi_json' => $recommendation,
                    'lokasi' => $project->lokasi,
                    'tanggal_prediksi' => now()->subDays(10 - ($i * 3))->toDateString(),
                ]);
            }
        }
    }
}
