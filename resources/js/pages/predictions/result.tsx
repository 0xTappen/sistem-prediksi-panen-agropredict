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
import type { InputLog, Prediction, Project, Recommendation } from '@/types';

export default function PredictionResult({
    inputLog,
    project,
    prediction,
    recommendation,
}: {
    inputLog: InputLog;
    project: Project;
    prediction: Prediction;
    recommendation: Recommendation;
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

                <Card className="rounded-2xl border border-border">
                    <CardHeader>
                        <CardTitle>Ringkasan Rekomendasi</CardTitle>
                        <CardDescription>{recommendation.ringkasan_status}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Pupuk disarankan: <span className="font-medium text-foreground">{recommendation.pupuk_disarankan}</span>
                        </p>
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

PredictionResult.layout = {
    breadcrumbs: [{ title: 'Hasil Prediksi', href: '#' }],
};
