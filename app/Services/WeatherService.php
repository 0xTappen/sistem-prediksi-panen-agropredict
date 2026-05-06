<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WeatherService
{
    protected const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
    protected const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

    /**
     * @return array{suhu: float, kelembapan_udara: float, curah_hujan: float, sumber_cuaca: string}
     */
    public function getWeatherByLocation(string $location): array
    {
        $baseUrl = (string) config('services.weather.base_url');
        $mockMode = (bool) config('services.weather.mock');

        if ($mockMode) {
            return $this->mockFromLocation($location);
        }

        $errors = [];
        $adm4 = $this->extractAdm4Code($location);

        if ($adm4 !== null) {
            try {
                return $this->getWeatherFromBmkg($baseUrl, $adm4);
            } catch (\Throwable $exception) {
                $errors[] = $exception->getMessage();
            }
        }

        try {
            return $this->getWeatherFromOpenMeteo($location);
        } catch (\Throwable $exception) {
            $errors[] = $exception->getMessage();
        }

        throw new RuntimeException(
            'Gagal mengambil data cuaca otomatis. Silakan input manual. Detail: '.implode(' | ', array_unique($errors)),
        );
    }

    /**
     * @return array{suhu: float, kelembapan_udara: float, curah_hujan: float, sumber_cuaca: string}
     */
    protected function getWeatherFromBmkg(string $baseUrl, string $adm4): array
    {
        if ($baseUrl === '') {
            throw new RuntimeException('Konfigurasi WEATHER_API_BASE_URL belum diatur.');
        }

        $response = Http::timeout(8)->acceptJson()->get($baseUrl, ['adm4' => $adm4]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal mengambil data cuaca dari API BMKG.');
        }

        $payload = $response->json();
        $forecast = $this->resolveNearestForecast($payload);

        $temp = data_get($forecast, 't');
        $humidity = data_get($forecast, 'hu');
        $rain = data_get($forecast, 'tp');

        if (! is_numeric($temp) || ! is_numeric($humidity) || ! is_numeric($rain)) {
            throw new RuntimeException('Format data cuaca dari API BMKG tidak valid.');
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
    protected function getWeatherFromOpenMeteo(string $location): array
    {
        $geoResponse = Http::timeout(8)->acceptJson()->get(self::OPEN_METEO_GEOCODING_URL, [
            'name' => $location,
            'count' => 1,
            'language' => 'id',
            'format' => 'json',
        ]);

        if ($geoResponse->failed()) {
            throw new RuntimeException('Gagal mencari koordinat lokasi.');
        }

        $geo = $geoResponse->json();
        $firstResult = data_get($geo, 'results.0');
        $lat = data_get($firstResult, 'latitude');
        $lon = data_get($firstResult, 'longitude');

        if (! is_numeric($lat) || ! is_numeric($lon)) {
            throw new RuntimeException('Lokasi tidak dikenali oleh geocoding.');
        }

        $forecastResponse = Http::timeout(8)->acceptJson()->get(self::OPEN_METEO_FORECAST_URL, [
            'latitude' => (float) $lat,
            'longitude' => (float) $lon,
            'current' => 'temperature_2m,relative_humidity_2m,precipitation',
            'timezone' => 'auto',
            'forecast_days' => 1,
        ]);

        if ($forecastResponse->failed()) {
            throw new RuntimeException('Gagal mengambil data cuaca dari fallback API.');
        }

        $forecast = $forecastResponse->json();
        $temp = data_get($forecast, 'current.temperature_2m');
        $humidity = data_get($forecast, 'current.relative_humidity_2m');
        $rain = data_get($forecast, 'current.precipitation');

        if (! is_numeric($temp) || ! is_numeric($humidity) || ! is_numeric($rain)) {
            throw new RuntimeException('Format data cuaca fallback tidak valid.');
        }

        return [
            'suhu' => round((float) $temp, 2),
            'kelembapan_udara' => round((float) $humidity, 2),
            'curah_hujan' => round((float) $rain, 2),
            'sumber_cuaca' => 'api',
        ];
    }

    protected function extractAdm4Code(string $location): ?string
    {
        if (preg_match('/\b\d{2}\.\d{2}\.\d{2}\.\d{4}\b/', $location, $matches) === 1) {
            return $matches[0];
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function resolveNearestForecast(array $payload): array
    {
        $cuacaByDay = data_get($payload, 'data.0.cuaca', []);

        if (! is_array($cuacaByDay)) {
            throw new RuntimeException('Data prakiraan BMKG tidak ditemukan.');
        }

        $forecasts = [];

        foreach ($cuacaByDay as $itemsPerDay) {
            if (! is_array($itemsPerDay)) {
                continue;
            }

            foreach ($itemsPerDay as $item) {
                if (! is_array($item)) {
                    continue;
                }

                if (! is_numeric(data_get($item, 't')) || ! is_numeric(data_get($item, 'hu')) || ! is_numeric(data_get($item, 'tp'))) {
                    continue;
                }

                $forecasts[] = $item;
            }
        }

        if ($forecasts === []) {
            throw new RuntimeException('Data prakiraan BMKG tidak memiliki nilai suhu/kelembapan/curah hujan.');
        }

        $now = CarbonImmutable::now('Asia/Jakarta');
        $nearest = null;
        $nearestDistance = null;

        foreach ($forecasts as $forecast) {
            $localDateTime = (string) data_get($forecast, 'local_datetime', '');

            try {
                $forecastTime = CarbonImmutable::parse($localDateTime, 'Asia/Jakarta');
            } catch (\Throwable) {
                continue;
            }

            $distance = abs($forecastTime->diffInSeconds($now, false));

            if ($nearestDistance === null || $distance < $nearestDistance) {
                $nearest = $forecast;
                $nearestDistance = $distance;
            }
        }

        if (is_array($nearest)) {
            return $nearest;
        }

        return $forecasts[0];
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
