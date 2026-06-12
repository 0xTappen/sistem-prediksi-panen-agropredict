<?php

namespace App\Http\Controllers;

use App\Models\PredictionHistory;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ModelEvaluationService;

class DashboardController extends Controller
{
    public function __construct(
        protected ModelEvaluationService $evaluationService,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $totalProjects = Project::query()
            ->where('user_id', $user->id)
            ->count();

        $totalPredictions = PredictionHistory::query()
            ->where('user_id', $user->id)
            ->count();

        $latestPrediction = PredictionHistory::query()
            ->with('project:id,nama_tanaman,lokasi')
            ->where('user_id', $user->id)
            ->latest('tanggal_prediksi')
            ->first();

        $chart = PredictionHistory::query()
            ->where('user_id', $user->id)
            ->latest('tanggal_prediksi')
            ->limit(7)
            ->get(['estimasi_panen_ton', 'tanggal_prediksi'])
            ->reverse()
            ->values()
            ->map(fn (PredictionHistory $history): array => [
                'tanggal' => $history->tanggal_prediksi->format('d/m'),
                'estimasi' => $history->estimasi_panen_ton,
            ]);

        $recentHistories = PredictionHistory::query()
            ->with('project:id,nama_tanaman,lokasi')
            ->where('user_id', $user->id)
            ->latest('tanggal_prediksi')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_projects' => $totalProjects,
                'total_predictions' => $totalPredictions,
                'latest_prediction' => $latestPrediction,
                'latest_recommendation' => $latestPrediction?->rekomendasi_json['ringkasan_status'] ?? null,
            ],
            'chart' => $chart,
            'recentHistories' => $recentHistories,
            'modelEvaluation' => $this->evaluationService->summary(),
        ]);
    }
}
