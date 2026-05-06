<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInputLogRequest;
use App\Models\InputLog;
use App\Models\Project;
use App\Services\WeatherService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InputLogController extends Controller
{
    public function __construct(protected WeatherService $weatherService)
    {
    }

    public function create(Request $request): Response
    {
        $projects = $request->user()->projects()
            ->latest()
            ->get(['id', 'nama_tanaman', 'jenis_tanaman', 'lokasi', 'luas_lahan']);

        $selectedProject = null;
        $weatherData = null;
        $weatherError = null;
        $locationOverride = trim((string) $request->query('location_override', ''));
        $weatherLocationUsed = null;

        if ($request->filled('project_id')) {
            $selectedProject = Project::query()
                ->where('user_id', $request->user()->id)
                ->find($request->integer('project_id'));
        }

        if ($locationOverride !== '') {
            $weatherLocationUsed = $locationOverride;
        } elseif ($selectedProject) {
            $weatherLocationUsed = $selectedProject->lokasi;
        }

        if ($weatherLocationUsed !== null) {
            try {
                $weatherData = $this->weatherService->getWeatherByLocation($weatherLocationUsed);
            } catch (\Throwable $exception) {
                $weatherError = $exception->getMessage();
            }
        }

        return Inertia::render('inputs/create', [
            'projects' => $projects,
            'selectedProject' => $selectedProject,
            'weatherData' => $weatherData,
            'weatherError' => $weatherError,
            'weatherLocationUsed' => $weatherLocationUsed,
            'locationOverride' => $locationOverride,
        ]);
    }

    public function store(StoreInputLogRequest $request): RedirectResponse
    {
        $project = Project::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($request->integer('project_id'));

        $inputLog = InputLog::query()->create([
            ...$request->validated(),
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
        ]);

        return to_route('predictions.result', $inputLog)
            ->with('toast', ['type' => 'success', 'message' => 'Data input berhasil disimpan, prediksi sedang ditampilkan.']);
    }
}
