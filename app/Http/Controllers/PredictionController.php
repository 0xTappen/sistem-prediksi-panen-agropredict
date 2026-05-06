<?php

namespace App\Http\Controllers;

use App\Models\InputLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Services\PredictionService;
use App\Services\RecommendationService;
use Inertia\Inertia;
use Inertia\Response;

class PredictionController extends Controller
{
    public function __construct(
        protected PredictionService $predictionService,
        protected RecommendationService $recommendationService,
    ) {
    }

    public function process(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'input_log_id' => ['required', 'exists:input_logs,id'],
        ]);

        $inputLog = InputLog::query()->findOrFail((int) $validated['input_log_id']);
        $this->authorize('view', $inputLog);

        return to_route('predictions.result', $inputLog);
    }

    public function result(InputLog $inputLog): Response
    {
        $this->authorize('view', $inputLog);

        $inputLog->load('project');

        $prediction = $this->predictionService->predict($inputLog->project, $inputLog);
        $recommendation = $this->recommendationService->generate($inputLog->project, $inputLog, $prediction);

        return Inertia::render('predictions/result', [
            'inputLog' => $inputLog,
            'project' => $inputLog->project,
            'prediction' => $prediction,
            'recommendation' => $recommendation,
        ]);
    }
}
