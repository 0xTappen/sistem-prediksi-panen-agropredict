<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class WeatherService
{
    /**
     * @return array{suhu: float, kelembapan_udara: float, curah_hujan: float, sumber_cuaca: string}
     */
    public function getWeatherByLocation(string $location): array
    {
        $apiKey = (string) config('services.weather.api_key');
        $baseUrl = (string) config('services.weather.base_url');
        $mockMode = (bool) config('services.weather.mock');

        if ($mockMode || $apiKey === '' || $baseUrl === '') {
            return $this->mockFromLocation($location);
        }

        $response = Http::timeout(8)->acceptJson()->get($baseUrl, [
            'key' => $apiKey,
            'q' => $location,
            'aqi' => 'no',
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal mengambil data cuaca dari API.');
        }

        $payload = $response->json();

        $temp = data_get($payload, 'current.temp_c');
        $humidity = data_get($payload, 'current.humidity');
        $rain = data_get($payload, 'current.precip_mm');

        if (! is_numeric($temp) || ! is_numeric($humidity) || ! is_numeric($rain)) {
            throw new RuntimeException('Format data cuaca dari API tidak valid.');
        }

        return [
            'suhu' => round((float) $temp, 2),
            'kelembapan_udara' => round((float) $humidity, 2),
            'curah_hujan' => round((float) $rain, 2),
            'sumber_cuaca' => 'api',
        ];
    }

    /**
     * @return array{suhu: float, kelembapan_udara: float, curah_hujan: float, sumber_cuaca: string}
     */
    protected function mockFromLocation(string $location): array
    {
        $seed = abs(crc32(mb_strtolower(trim($location))));

        return [
            'suhu' => round(24 + ($seed % 90) / 10, 2),
            'kelembapan_udara' => round(55 + ($seed % 35), 2),
            'curah_hujan' => round(($seed % 180) / 3, 2),
            'sumber_cuaca' => 'api',
        ];
    }
}
