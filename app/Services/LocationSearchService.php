<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class LocationSearchService
{
    /**
     * @return array<int, array{label: string, latitude: float, longitude: float}>
     */
    public function search(string $query, int $limit = 5): array
    {
        $baseUrl = rtrim((string) config('services.nominatim.base_url'), '/');
        $userAgent = trim((string) config('services.nominatim.user_agent'));
        $contactEmail = trim((string) config('services.nominatim.contact_email'));
        $countryCodes = trim((string) config('services.nominatim.country_codes'));

        if ($baseUrl === '') {
            throw new RuntimeException('Konfigurasi NOMINATIM_BASE_URL belum diatur.');
        }

        if ($userAgent === '') {
            throw new RuntimeException('Konfigurasi NOMINATIM_USER_AGENT belum diatur.');
        }

        $params = [
            'q' => $query,
            'format' => 'jsonv2',
            'addressdetails' => 1,
            'limit' => max(1, min($limit, 8)),
        ];

        if ($countryCodes !== '') {
            $params['countrycodes'] = $countryCodes;
        }

        if ($contactEmail !== '') {
            $params['email'] = $contactEmail;
        }

        $response = Http::timeout(8)
            ->acceptJson()
            ->withHeaders([
                'User-Agent' => $userAgent,
                'Accept-Language' => 'id,en;q=0.8',
            ])
            ->get($baseUrl.'/search', $params);

        if ($response->failed()) {
            throw new RuntimeException('Gagal mengambil data lokasi. Coba lagi beberapa saat.');
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            return [];
        }

        $results = [];

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $label = trim((string) data_get($item, 'display_name'));
            $lat = data_get($item, 'lat');
            $lon = data_get($item, 'lon');

            if ($label === '' || ! is_numeric($lat) || ! is_numeric($lon)) {
                continue;
            }

            $results[] = [
                'label' => $label,
                'latitude' => round((float) $lat, 7),
                'longitude' => round((float) $lon, 7),
            ];
        }

        return $results;
    }

    public function reverse(float $latitude, float $longitude): ?string
    {
        $baseUrl = rtrim((string) config('services.nominatim.base_url'), '/');
        $userAgent = trim((string) config('services.nominatim.user_agent'));
        $contactEmail = trim((string) config('services.nominatim.contact_email'));

        if ($baseUrl === '') {
            throw new RuntimeException('Konfigurasi NOMINATIM_BASE_URL belum diatur.');
        }

        if ($userAgent === '') {
            throw new RuntimeException('Konfigurasi NOMINATIM_USER_AGENT belum diatur.');
        }

        $params = [
            'lat' => $latitude,
            'lon' => $longitude,
            'format' => 'jsonv2',
            'zoom' => 18,
            'addressdetails' => 1,
        ];

        if ($contactEmail !== '') {
            $params['email'] = $contactEmail;
        }

        $response = Http::timeout(8)
            ->acceptJson()
            ->withHeaders([
                'User-Agent' => $userAgent,
                'Accept-Language' => 'id,en;q=0.8',
            ])
            ->get($baseUrl.'/reverse', $params);

        if ($response->failed()) {
            throw new RuntimeException('Gagal mengambil detail alamat dari koordinat.');
        }

        $label = trim((string) data_get($response->json(), 'display_name', ''));

        return $label !== '' ? $label : null;
    }
}
