<?php

namespace App\Http\Controllers;

use App\Models\InputLog;
use App\Models\PredictionHistory;
use App\Services\PredictionService;
use App\Services\RecommendationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionHistoryController extends Controller
{
    public function __construct(
        protected PredictionService $predictionService,
        protected RecommendationService $recommendationService,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PredictionHistory::class);

        $search = trim((string) $request->string('q'));
        $status = trim((string) $request->string('status'));

        $histories = PredictionHistory::query()
            ->with('project:id,nama_tanaman,lokasi')
            ->where('user_id', $request->user()->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('lokasi', 'like', "%{$search}%")
                        ->orWhereHas('project', function ($projectQuery) use ($search) {
                            $projectQuery->where('nama_tanaman', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['rendah', 'sedang', 'tinggi'], true), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest('tanggal_prediksi')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('histories/index', [
            'histories' => $histories,
            'filters' => [
                'q' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'input_log_id' => ['required', 'exists:input_logs,id'],
        ], [
            'input_log_id.required' => 'Input log wajib dipilih.',
            'input_log_id.exists' => 'Input log tidak ditemukan.',
        ]);

        $inputLog = InputLog::query()
            ->with('project')
            ->where('user_id', $request->user()->id)
            ->findOrFail((int) $validated['input_log_id']);

        $prediction = $this->predictionService->predict($inputLog->project, $inputLog);
        $recommendation = $this->recommendationService->generate($inputLog->project, $inputLog, $prediction);

        $history = PredictionHistory::query()->create([
            'user_id' => $request->user()->id,
            'project_id' => $inputLog->project_id,
            'input_log_id' => $inputLog->id,
            'estimasi_panen_ton' => $prediction['estimasi_panen_ton'],
            'skor_kecocokan' => $prediction['skor_kecocokan'],
            'status' => $prediction['status'],
            'faktor_dominan' => $prediction['faktor_dominan'],
            'rekomendasi_json' => $recommendation,
            'lokasi' => $inputLog->project->lokasi,
            'tanggal_prediksi' => now()->toDateString(),
        ]);

        return to_route('histories.show', $history)
            ->with('toast', ['type' => 'success', 'message' => 'Hasil prediksi berhasil disimpan ke riwayat.']);
    }

    public function show(PredictionHistory $history): Response
    {
        $this->authorize('view', $history);

        $history->load(['project', 'inputLog']);

        return Inertia::render('histories/show', [
            'history' => $history,
        ]);
    }

    public function destroy(PredictionHistory $history): RedirectResponse
    {
        $this->authorize('delete', $history);

        $history->delete();

        return to_route('histories.index')
            ->with('toast', ['type' => 'success', 'message' => 'Riwayat prediksi berhasil dihapus.']);
    }

    public function exportPdf(PredictionHistory $history)
    {
        $this->authorize('view', $history);

        $history->load(['project', 'inputLog', 'user']);

        $pdf = Pdf::loadView('pdf.history-report', [
            'history' => $history,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('laporan-prediksi-'.$history->id.'.pdf');
    }
}
