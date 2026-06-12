<?php

namespace App\Services;

class AgronomicDatasetService
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public function cropProfiles(): array
    {
        return [
            'padi' => [
                'label' => 'Padi',
                'base_yield_per_ha' => 5.8,
                'ideal' => [
                    'nitrogen' => 62,
                    'phosphorus' => 54,
                    'potassium' => 58,
                    'ph_tanah' => 6.6,
                    'kelembapan_tanah' => 72,
                    'jumlah_air' => 88,
                    'suhu' => 28,
                    'kelembapan_udara' => 77,
                    'curah_hujan' => 155,
                ],
            ],
            'jagung' => [
                'label' => 'Jagung',
                'base_yield_per_ha' => 6.2,
                'ideal' => [
                    'nitrogen' => 68,
                    'phosphorus' => 56,
                    'potassium' => 60,
                    'ph_tanah' => 6.4,
                    'kelembapan_tanah' => 66,
                    'jumlah_air' => 74,
                    'suhu' => 29,
                    'kelembapan_udara' => 70,
                    'curah_hujan' => 135,
                ],
            ],
            'kedelai' => [
                'label' => 'Kedelai',
                'base_yield_per_ha' => 2.4,
                'ideal' => [
                    'nitrogen' => 48,
                    'phosphorus' => 54,
                    'potassium' => 56,
                    'ph_tanah' => 6.5,
                    'kelembapan_tanah' => 64,
                    'jumlah_air' => 60,
                    'suhu' => 28,
                    'kelembapan_udara' => 69,
                    'curah_hujan' => 120,
                ],
            ],
            'cabai' => [
                'label' => 'Cabai',
                'base_yield_per_ha' => 8.5,
                'ideal' => [
                    'nitrogen' => 60,
                    'phosphorus' => 58,
                    'potassium' => 66,
                    'ph_tanah' => 6.3,
                    'kelembapan_tanah' => 62,
                    'jumlah_air' => 58,
                    'suhu' => 27,
                    'kelembapan_udara' => 72,
                    'curah_hujan' => 112,
                ],
            ],
            'tomat' => [
                'label' => 'Tomat',
                'base_yield_per_ha' => 9.5,
                'ideal' => [
                    'nitrogen' => 58,
                    'phosphorus' => 55,
                    'potassium' => 64,
                    'ph_tanah' => 6.4,
                    'kelembapan_tanah' => 61,
                    'jumlah_air' => 57,
                    'suhu' => 26,
                    'kelembapan_udara' => 71,
                    'curah_hujan' => 105,
                ],
            ],
            'generic' => [
                'label' => 'Tanaman Umum',
                'base_yield_per_ha' => 4.8,
                'ideal' => [
                    'nitrogen' => 58,
                    'phosphorus' => 54,
                    'potassium' => 58,
                    'ph_tanah' => 6.4,
                    'kelembapan_tanah' => 65,
                    'jumlah_air' => 64,
                    'suhu' => 28,
                    'kelembapan_udara' => 71,
                    'curah_hujan' => 125,
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function benchmarkRows(): array
    {
        static $rows;

        if (is_array($rows)) {
            return $rows;
        }

        $rows = [];
        $variantOffsets = [
            ['nitrogen' => -3, 'phosphorus' => 1, 'potassium' => 0, 'ph_tanah' => -0.05, 'kelembapan_tanah' => -2, 'jumlah_air' => 2, 'suhu' => 0.4, 'kelembapan_udara' => 1.5, 'curah_hujan' => 6],
            ['nitrogen' => 0, 'phosphorus' => 0, 'potassium' => 0, 'ph_tanah' => 0.00, 'kelembapan_tanah' => 0, 'jumlah_air' => 0, 'suhu' => 0.0, 'kelembapan_udara' => 0.0, 'curah_hujan' => 0],
            ['nitrogen' => 4, 'phosphorus' => -2, 'potassium' => 2, 'ph_tanah' => 0.08, 'kelembapan_tanah' => 3, 'jumlah_air' => -3, 'suhu' => -0.5, 'kelembapan_udara' => -1.5, 'curah_hujan' => -8],
        ];

        foreach ($this->cropProfiles() as $cropKey => $profile) {
            foreach ($this->scenarioTemplates() as $scenarioKey => $scenario) {
                foreach ($variantOffsets as $variantIndex => $variant) {
                    $features = [];

                    foreach ($profile['ideal'] as $feature => $baseValue) {
                        $value = $baseValue + ($scenario['delta'][$feature] ?? 0) + ($variant[$feature] ?? 0);
                        $features[$feature] = $this->clampFeature($feature, $value);
                    }

                    $rows[] = [
                        'crop_key' => $cropKey,
                        'crop_label' => $profile['label'],
                        'scenario_key' => $scenarioKey,
                        'scenario_label' => $scenario['label'],
                        'variant' => $variantIndex + 1,
                        'target_yield_per_ha' => round($profile['base_yield_per_ha'] * $scenario['yield_factor'] * (1 + (($variantIndex - 1) * 0.02)), 2),
                        'status' => $this->statusFromFactor($scenario['yield_factor']),
                        'features' => $features,
                    ];
                }
            }
        }

        return $rows;
    }

    /**
     * @return array<string, mixed>
     */
    public function resolveCropProfile(string $jenisTanaman): array
    {
        $normalized = mb_strtolower(trim($jenisTanaman));

        foreach ($this->cropProfiles() as $key => $profile) {
            if ($key !== 'generic' && str_contains($normalized, $key)) {
                return ['key' => $key, ...$profile];
            }
        }

        return ['key' => 'generic', ...$this->cropProfiles()['generic']];
    }

    protected function statusFromFactor(float $yieldFactor): string
    {
        if ($yieldFactor >= 0.92) {
            return 'tinggi';
        }

        if ($yieldFactor >= 0.76) {
            return 'sedang';
        }

        return 'rendah';
    }

    protected function clampFeature(string $feature, float $value): float
    {
        $bounds = match ($feature) {
            'nitrogen', 'phosphorus', 'potassium' => [10, 110],
            'ph_tanah' => [4.5, 8.5],
            'kelembapan_tanah', 'kelembapan_udara' => [25, 95],
            'jumlah_air' => [10, 150],
            'suhu' => [18, 38],
            'curah_hujan' => [10, 320],
            default => [0, 999],
        };

        return round(max($bounds[0], min($bounds[1], $value)), 2);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    protected function scenarioTemplates(): array
    {
        return [
            'optimal' => [
                'label' => 'Optimal',
                'yield_factor' => 1.00,
                'delta' => [],
            ],
            'slightly_suboptimal' => [
                'label' => 'Sedikit Di Bawah Optimal',
                'yield_factor' => 0.92,
                'delta' => [
                    'nitrogen' => -6,
                    'jumlah_air' => -8,
                    'curah_hujan' => -12,
                ],
            ],
            'nitrogen_low' => [
                'label' => 'Nitrogen Rendah',
                'yield_factor' => 0.83,
                'delta' => [
                    'nitrogen' => -24,
                    'phosphorus' => -8,
                    'potassium' => -6,
                ],
            ],
            'acidic_soil' => [
                'label' => 'Tanah Asam',
                'yield_factor' => 0.78,
                'delta' => [
                    'ph_tanah' => -1.05,
                    'nitrogen' => -10,
                    'phosphorus' => -6,
                ],
            ],
            'drought_stress' => [
                'label' => 'Kekeringan',
                'yield_factor' => 0.68,
                'delta' => [
                    'kelembapan_tanah' => -18,
                    'jumlah_air' => -34,
                    'curah_hujan' => -55,
                    'kelembapan_udara' => -10,
                    'suhu' => 2.8,
                ],
            ],
            'excessive_rain' => [
                'label' => 'Curah Hujan Tinggi',
                'yield_factor' => 0.72,
                'delta' => [
                    'kelembapan_tanah' => 14,
                    'jumlah_air' => 18,
                    'curah_hujan' => 92,
                    'kelembapan_udara' => 11,
                    'suhu' => -1.0,
                ],
            ],
            'heat_stress' => [
                'label' => 'Suhu Tinggi',
                'yield_factor' => 0.76,
                'delta' => [
                    'suhu' => 4.7,
                    'kelembapan_udara' => -7,
                    'jumlah_air' => -10,
                ],
            ],
            'npk_imbalanced' => [
                'label' => 'NPK Tidak Seimbang',
                'yield_factor' => 0.74,
                'delta' => [
                    'nitrogen' => 18,
                    'phosphorus' => -18,
                    'potassium' => -12,
                    'ph_tanah' => -0.25,
                ],
            ],
            'humid_disease_risk' => [
                'label' => 'Lembap dan Rawan Penyakit',
                'yield_factor' => 0.79,
                'delta' => [
                    'kelembapan_tanah' => 16,
                    'kelembapan_udara' => 13,
                    'curah_hujan' => 55,
                    'jumlah_air' => 10,
                ],
            ],
        ];
    }
}
