<?php

namespace App\Http\Controllers;

use App\Services\LocationSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class LocationController extends Controller
{
    public function search(Request $request, LocationSearchService $locationSearchService): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:3', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:8'],
        ]);

        $query = trim((string) $validated['q']);
        $limit = (int) ($validated['limit'] ?? 5);

        try {
            $results = $locationSearchService->search($query, $limit);
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'q' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'data' => $results,
        ]);
    }

    public function reverse(Request $request, LocationSearchService $locationSearchService): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
        ]);

        try {
            $label = $locationSearchService->reverse((float) $validated['lat'], (float) $validated['lon']);
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'lat' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'data' => [
                'label' => $label,
            ],
        ]);
    }
}
