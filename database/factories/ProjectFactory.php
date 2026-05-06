<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
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
            'nama_tanaman' => fake()->randomElement(['Padi Ciherang', 'Jagung Hibrida', 'Cabai Rawit']),
            'jenis_tanaman' => fake()->randomElement(['Padi', 'Jagung', 'Cabai']),
            'luas_lahan' => fake()->randomFloat(2, 0.5, 12),
            'lokasi' => fake()->city(),
            'latitude' => fake()->latitude(-8, 6),
            'longitude' => fake()->longitude(95, 141),
        ];
    }
}
