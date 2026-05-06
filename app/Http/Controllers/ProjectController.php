<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $search = trim((string) $request->string('q'));

        $projects = $request->user()->projects()
            ->withCount(['inputLogs', 'predictionHistories'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_tanaman', 'like', "%{$search}%")
                        ->orWhere('jenis_tanaman', 'like', "%{$search}%")
                        ->orWhere('lokasi', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => [
                'q' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('projects/create');
    }

    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);

        $project = $request->user()->projects()->create($request->validated());

        return to_route('projects.show', $project)
            ->with('toast', ['type' => 'success', 'message' => 'Proyek berhasil ditambahkan.']);
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load([
            'inputLogs' => fn ($q) => $q->latest()->limit(5),
            'predictionHistories' => fn ($q) => $q->latest('tanggal_prediksi')->limit(5),
        ]);

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return to_route('projects.show', $project)
            ->with('toast', ['type' => 'success', 'message' => 'Proyek berhasil diperbarui.']);
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return to_route('projects.index')
            ->with('toast', ['type' => 'success', 'message' => 'Proyek berhasil dihapus.']);
    }
}
