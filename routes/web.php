<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InputLogController;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\PredictionHistoryController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('projects', ProjectController::class);

    Route::get('inputs/create', [InputLogController::class, 'create'])->name('inputs.create');
    Route::post('inputs', [InputLogController::class, 'store'])->name('inputs.store');

    Route::post('predictions/process', [PredictionController::class, 'process'])->name('predictions.process');
    Route::get('predictions/result/{inputLog}', [PredictionController::class, 'result'])->name('predictions.result');

    Route::get('recommendations/{inputLog}', [RecommendationController::class, 'show'])->name('recommendations.show');

    Route::get('histories', [PredictionHistoryController::class, 'index'])->name('histories.index');
    Route::post('histories', [PredictionHistoryController::class, 'store'])->name('histories.store');
    Route::get('histories/{history}', [PredictionHistoryController::class, 'show'])->name('histories.show');
    Route::delete('histories/{history}', [PredictionHistoryController::class, 'destroy'])->name('histories.destroy');
    Route::get('histories/{history}/export-pdf', [PredictionHistoryController::class, 'exportPdf'])->name('histories.export-pdf');

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/settings.php';
