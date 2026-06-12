import { Head, Link } from '@inertiajs/react';
import { CloudSun, Leaf, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { InputLog, ModelEvaluation, Prediction, Project, Recommendation } from '@/types';

export default function RecommendationShow({
    inputLog,
    project,
    prediction,
    recommendation,
    evaluation,
}: {
    inputLog: InputLog;
    project: Project;
    prediction: Prediction;
    recommendation: Recommendation;
    evaluation: ModelEvaluation;
}) {
    return (
        <>
            <Head title="Rekomendasi Pintar" />
            <div className="space-y-4">
                <PageHeader
                    title="Rekomendasi Pintar"
                    description={`${project.nama_tanaman} • ${project.lokasi}`}
                />

                <Card className="rounded-2xl border border-border bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-accent" />
                            Ringkasan Prediksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Estimasi: <span className="font-medium text-foreground">{prediction.estimasi_panen_ton.toFixed(2)} ton</span>
                        </p>
                        <p>
                            Skor kecocokan: <span className="font-medium text-foreground">{prediction.skor_kecocokan.toFixed(2)}</span>
                        </p>
                        <p>
                            Confidence: <span className="font-medium text-foreground">{Math.round(prediction.confidence_score ?? 0)}%</span>
                        </p>
                        <StatusBadge status={prediction.status} />
                        <p>{recommendation.ringkasan_status}</p>
                        <p>{recommendation.insight_model}</p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <FormSection title="Rekomendasi Utama">
                        <Info icon={Leaf} label="Pupuk Disarankan" value={recommendation.pupuk_disarankan} />
                        <Info icon={Leaf} label="Waktu Tanam Terbaik" value={recommendation.waktu_tanam_terbaik} />
                        <Info icon={Leaf} label="Waktu Panen Prediksi" value={recommendation.waktu_panen_prediksi} />
                        <Info icon={CloudSun} label="Pengendalian Hama" value={recommendation.pengendalian_hama} />
                        <Info icon={CloudSun} label="Catatan Risiko" value={recommendation.catatan_risiko} />
                    </FormSection>

                    <FormSection title="Tips Perawatan">
                        <div className="space-y-3">
                            {recommendation.tips_perawatan.map((tip, idx) => (
                                <div key={`${idx}-${tip}`}>
                                    <p className="text-sm text-foreground">{idx + 1}. {tip}</p>
                                    {idx < recommendation.tips_perawatan.length - 1 ? (
                                        <Separator className="mt-2" />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </FormSection>
                </div>

                {recommendation.prioritas_ai?.length ? (
                    <FormSection title="Prioritas AI">
                        <div className="space-y-2">
                            {recommendation.prioritas_ai.map((item) => (
                                <div key={item} className="rounded-2xl border border-border bg-muted/40 p-3 text-sm text-foreground">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </FormSection>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                    <FormSection title="Faktor Paling Berpengaruh">
                        <div className="space-y-3">
                            {(recommendation.faktor_paling_berpengaruh ?? []).map((item) => (
                                <div key={item.factor} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">{item.factor}</span>
                                        <span className="text-muted-foreground">{item.impact_percent.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.impact_percent)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FormSection>

                    <FormSection title="Benchmark Model">
                        <Info icon={Sparkles} label="Engine" value={evaluation.engine} />
                        <Info icon={Sparkles} label="MAE Model" value={`${evaluation.model_mae_ton_ha.toFixed(3)} ton/ha`} />
                        <Info icon={Sparkles} label="MAE Baseline" value={`${evaluation.baseline_mae_ton_ha.toFixed(3)} ton/ha`} />
                        <Info icon={Sparkles} label="Improvement" value={`${evaluation.improvement_percent.toFixed(1)}%`} />
                    </FormSection>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={`/predictions/result/${inputLog.id}`}>Kembali ke Hasil</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function Info({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-muted/50 p-3">
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
            </p>
            <p className="mt-1 text-sm text-foreground">{value}</p>
        </div>
    );
}

RecommendationShow.layout = {
    breadcrumbs: [{ title: 'Rekomendasi Pintar', href: '#' }],
};
