<?php

namespace App\Services;

class ModelEvaluationService
{
    public function __construct(
        protected AgronomicDatasetService $datasetService,
        protected PredictionService $predictionService,
        protected LegacyPredictionBaselineService $baselineService,
    ) {
    }

    /**
     * @return array<string, float|int|string>
     */
    public function summary(): array
    {
        static $summary;

        if (is_array($summary)) {
            return $summary;
        }

        $rows = $this->datasetService->benchmarkRows();
        $modelErrors = [];
        $baselineErrors = [];
        $modelSquaredErrors = [];
        $baselineSquaredErrors = [];

        foreach ($rows as $row) {
            $modelPrediction = $this->predictionService->predictScenario(
                $row['crop_label'],
                1.0,
                $row['features'],
                false,
                $row['fingerprint'],
            );

            $baselinePrediction = $this->baselineService->predictScenario(
                $row['crop_label'],
                1.0,
                $row['features'],
            );

            $actualYield = (float) $row['target_yield_per_ha'];
            $modelError = abs((float) $modelPrediction['estimasi_panen_ton'] - $actualYield);
            $baselineError = abs((float) $baselinePrediction['estimasi_panen_ton'] - $actualYield);

            $modelErrors[] = $modelError;
            $baselineErrors[] = $baselineError;
            $modelSquaredErrors[] = $modelError ** 2;
            $baselineSquaredErrors[] = $baselineError ** 2;
        }

        $modelMae = $this->average($modelErrors);
        $baselineMae = $this->average($baselineErrors);
        $modelRmse = sqrt($this->average($modelSquaredErrors));
        $baselineRmse = sqrt($this->average($baselineSquaredErrors));
        $improvement = $baselineMae > 0 ? (($baselineMae - $modelMae) / $baselineMae) * 100 : 0.0;

        $summary = [
            'sample_size' => count($rows),
            'model_mae_ton_ha' => round($modelMae, 3),
            'model_rmse_ton_ha' => round($modelRmse, 3),
            'baseline_mae_ton_ha' => round($baselineMae, 3),
            'baseline_rmse_ton_ha' => round($baselineRmse, 3),
            'improvement_percent' => round($improvement, 2),
            'engine' => 'KNN agronomi + benchmark internal',
        ];

        return $summary;
    }

    /**
     * @param  array<int, float>  $numbers
     */
    protected function average(array $numbers): float
    {
        return count($numbers) > 0 ? array_sum($numbers) / count($numbers) : 0.0;
    }
}
