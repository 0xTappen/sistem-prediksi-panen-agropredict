<?php

use App\Services\ModelEvaluationService;

it('ModelEvaluationService menghasilkan ringkasan benchmark', function () {
    $summary = app(ModelEvaluationService::class)->summary();

    expect($summary)->toHaveKeys([
        'sample_size',
        'model_mae_ton_ha',
        'model_rmse_ton_ha',
        'baseline_mae_ton_ha',
        'baseline_rmse_ton_ha',
        'improvement_percent',
        'engine',
    ]);

    expect($summary['sample_size'])->toBeInt()->toBeGreaterThan(0);
    expect($summary['model_mae_ton_ha'])->toBeFloat();
    expect($summary['baseline_mae_ton_ha'])->toBeFloat();
});
