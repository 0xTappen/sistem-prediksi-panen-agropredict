<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserSetting>
 */
class UserSettingFactory extends Factory
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
            'theme' => fake()->randomElement(['light', 'dark', 'system']),
            'notification_enabled' => fake()->boolean(85),
            'temperature_unit' => 'celsius',
            'rainfall_unit' => 'mm',
            'yield_unit' => 'ton',
            'backup_enabled' => fake()->boolean(35),
        ];
    }
}
