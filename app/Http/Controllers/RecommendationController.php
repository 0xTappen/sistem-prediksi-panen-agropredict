<?php

namespace App\Http\Controllers;

use App\Models\InputLog;
use App\Services\PredictionService;
use App\Services\RecommendationService;
use Inertia\Inertia;
use Inertia\Response;

class RecommendationController extends Controller
{
    public function __construct(
        protected PredictionService $predictionService,
        protected RecommendationService $recommendationService,
    ) {
    }

    public function show(InputLog $inputLog): Response
    {
        $inputLog->load('project');
        $this->authorize('view', $inputLog);

        $prediction = $this->predictionService->predict($inputLog->project, $inputLog);
        $recommendation = $this->recommendationService->generate($inputLog->project, $inputLog, $prediction);

        return Inertia::render('recommendations/show', [
            'inputLog' => $inputLog,
            'project' => $inputLog->project,
            'prediction' => $prediction,
            'recommendation' => $recommendation,
        ]);
    }
}
