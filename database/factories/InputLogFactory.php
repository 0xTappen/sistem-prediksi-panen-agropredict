<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InputLog>
 */
class InputLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'nitrogen' => fake()->randomFloat(2, 30, 90),
            'phosphorus' => fake()->randomFloat(2, 30, 90),
            'potassium' => fake()->randomFloat(2, 30, 90),
            'ph_tanah' => fake()->randomFloat(2, 4.5, 8.5),
            'kelembapan_tanah' => fake()->randomFloat(2, 35, 90),
            'jumlah_air' => fake()->randomFloat(2, 10, 140),
            'suhu' => fake()->randomFloat(2, 20, 36),
            'kelembapan_udara' => fake()->randomFloat(2, 50, 90),
            'curah_hujan' => fake()->randomFloat(2, 0, 280),
            'sumber_cuaca' => fake()->randomElement(['api', 'manual']),
            'catatan' => fake()->optional()->sentence(),
        ];
    }
}
