import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Save, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InputLog, ModelEvaluation, Prediction, Project, Recommendation } from '@/types';

export default function PredictionResult({
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
    const chartData = useMemo(
        () =>
            Object.entries(prediction.komponen_skor ?? {}).map(([name, value]) => ({
                name,
                value,
            })),
        [prediction.komponen_skor],
    );

    const saveHistory = () => {
        router.post('/histories', { input_log_id: inputLog.id });
    };

    const topFactors = Object.entries(prediction.feature_importance ?? {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

    return (
        <>
            <Head title="Hasil Prediksi" />
            <div className="space-y-4">
                <PageHeader
                    title="Hasil Prediksi Panen"
                    description={`${project.nama_tanaman} • ${project.lokasi}`}
                />

                <Card className="overflow-hidden rounded-2xl border border-border">
                    <div className="bg-gradient-to-r from-primary to-[#255634] p-6 text-primary-foreground">
                        <p className="text-sm opacity-90">Estimasi Panen</p>
                        <p className="text-4xl font-semibold tracking-tight">
                            {prediction.estimasi_panen_ton.toFixed(2)} ton
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <StatusBadge status={prediction.status} />
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                                Skor {prediction.skor_kecocokan.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
                        <p>Faktor dominan: <span className="font-medium text-foreground">{prediction.faktor_dominan}</span></p>
                        <p>{prediction.catatan_prediksi}</p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        title="Confidence"
                        value={`${Math.round(prediction.confidence_score ?? 0)}%`}
                        hint={prediction.ringkasan_model?.confidence_label ?? 'model'}
                    />
                    <MetricCard
                        title="Produktivitas"
                        value={`${(prediction.estimasi_per_hektare_ton ?? 0).toFixed(2)} ton/ha`}
                        hint={prediction.ringkasan_model?.crop_profile ?? project.jenis_tanaman}
                    />
                    <MetricCard
                        title="MAE Model"
                        value={`${evaluation.model_mae_ton_ha.toFixed(3)} ton/ha`}
                        hint={`lebih baik ${evaluation.improvement_percent.toFixed(1)}% dari baseline`}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="rounded-2xl border border-border">
                        <CardHeader>
                            <CardTitle>Grafik Kecocokan Faktor</CardTitle>
                            <CardDescription>Visualisasi kualitas setiap variabel input</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={chartData}>
                                    <PolarGrid stroke="#D8E2C3" />
                                    <PolarAngleAxis dataKey="name" tick={{ fill: '#647064', fontSize: 11 }} />
                                    <Radar
                                        dataKey="value"
                                        stroke="#2F6B3F"
                                        fill="#A7C957"
                                        fillOpacity={0.45}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <FormSection title="Ringkasan Input" description="Data utama yang dipakai dalam perhitungan.">
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <Info label="N" value={inputLog.nitrogen.toFixed(2)} />
                            <Info label="P" value={inputLog.phosphorus.toFixed(2)} />
                            <Info label="K" value={inputLog.potassium.toFixed(2)} />
                            <Info label="pH Tanah" value={inputLog.ph_tanah.toFixed(2)} />
                            <Info label="Kelembapan Tanah" value={inputLog.kelembapan_tanah.toFixed(2)} />
                            <Info label="Jumlah Air" value={inputLog.jumlah_air.toFixed(2)} />
                            <Info label="Suhu" value={`${inputLog.suhu.toFixed(2)} °C`} />
                            <Info label="Kelembapan Udara" value={`${inputLog.kelembapan_udara.toFixed(2)} %`} />
                            <Info label="Curah Hujan" value={`${inputLog.curah_hujan.toFixed(2)} mm`} />
                        </div>
                    </FormSection>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="rounded-2xl border border-border">
                        <CardHeader>
                            <CardTitle>Faktor Paling Berpengaruh</CardTitle>
                            <CardDescription>Semakin besar persen, semakin sensitif terhadap hasil prediksi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topFactors.map(([factor, impact]) => (
                                <div key={factor} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">{factor}</span>
                                        <span className="text-muted-foreground">{impact.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, impact)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border">
                        <CardHeader>
                            <CardTitle>Simulasi Perbaikan</CardTitle>
                            <CardDescription>Estimasi jika faktor prioritas diperbaiki ke rentang ideal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Fokus: <span className="font-medium text-foreground">
                                    {(prediction.simulasi_perbaikan?.fokus_perbaikan ?? []).join(', ') || '-'}
                                </span>
                            </p>
                            <p>
                                Estimasi baru: <span className="font-medium text-foreground">
                                    {(prediction.simulasi_perbaikan?.estimasi_baru_ton ?? prediction.estimasi_panen_ton).toFixed(2)} ton
                                </span>
                            </p>
                            <p>
                                Potensi kenaikan: <span className="font-medium text-foreground">
                                    +{(prediction.simulasi_perbaikan?.delta_ton ?? 0).toFixed(2)} ton
                                </span>
                            </p>
                            <p>
                                Skor baru: <span className="font-medium text-foreground">
                                    {(prediction.simulasi_perbaikan?.skor_baru ?? prediction.skor_kecocokan).toFixed(2)}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-2xl border border-border">
                    <CardHeader>
                        <CardTitle>Ringkasan Rekomendasi</CardTitle>
                        <CardDescription>{recommendation.ringkasan_status}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Pupuk disarankan: <span className="font-medium text-foreground">{recommendation.pupuk_disarankan}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {recommendation.insight_model}
                        </p>
                        {recommendation.prioritas_ai?.length ? (
                            <div className="rounded-2xl border border-border bg-muted/40 p-3 text-sm text-foreground">
                                {recommendation.prioritas_ai.map((item) => (
                                    <p key={item}>{item}</p>
                                ))}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border">
                    <CardHeader>
                        <CardTitle>Benchmark Model</CardTitle>
                        <CardDescription>{evaluation.engine}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                        <Info label="Jumlah Sampel" value={String(evaluation.sample_size)} />
                        <Info label="RMSE Model" value={`${evaluation.model_rmse_ton_ha.toFixed(3)} ton/ha`} />
                        <Info label="RMSE Baseline" value={`${evaluation.baseline_rmse_ton_ha.toFixed(3)} ton/ha`} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border">
                    <CardHeader>
                        <CardTitle>Kasus Benchmark Terdekat</CardTitle>
                        <CardDescription>Kasus referensi yang paling mirip dengan kondisi lahan ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {(prediction.similar_cases ?? []).map((item) => (
                            <div key={`${item.scenario}-${item.distance}`} className="rounded-2xl border border-border bg-muted/40 p-3 text-sm">
                                <p className="font-medium text-foreground">{item.scenario}</p>
                                <p className="text-muted-foreground">{item.crop}</p>
                                <p className="mt-2 text-foreground">{item.yield_per_ha.toFixed(2)} ton/ha</p>
                                <p className="text-xs text-muted-foreground">distance {item.distance.toFixed(3)}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/recommendations/${inputLog.id}`}>
                            <Sparkles className="h-4 w-4" /> Lihat Rekomendasi
                        </Link>
                    </Button>
                    <Button onClick={saveHistory}>
                        <Save className="h-4 w-4" /> Simpan ke Riwayat
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href="/dashboard">
                            <BarChart3 className="h-4 w-4" /> Kembali ke Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{value}</p>
        </div>
    );
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
    return (
        <Card className="rounded-2xl border border-border">
            <CardContent className="space-y-1 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );
}

PredictionResult.layout = {
    breadcrumbs: [{ title: 'Hasil Prediksi', href: '#' }],
};
