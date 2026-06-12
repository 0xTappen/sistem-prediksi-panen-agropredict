import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, ClipboardPlus, FolderPlus, Sparkles, Sprout } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModelEvaluation, PredictionHistory } from '@/types';

type ChartPoint = {
    tanggal: string;
    estimasi: number;
};

type LatestPrediction = {
    id: number;
    estimasi_panen_ton: number;
    status: 'rendah' | 'sedang' | 'tinggi';
    faktor_dominan: string;
    project?: { nama_tanaman: string; lokasi: string };
} | null;

export default function Dashboard({
    stats,
    chart,
    recentHistories,
    modelEvaluation,
}: {
    stats: {
        total_projects: number;
        total_predictions: number;
        latest_prediction: LatestPrediction;
        latest_recommendation: string | null;
    };
    chart: ChartPoint[];
    recentHistories: PredictionHistory[];
    modelEvaluation: ModelEvaluation;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <PageHeader
                    title={`Halo, ${auth.user?.name}`}
                    description="Pantau proyek lahan, evaluasi AI, dan prediksi panen Anda hari ini."
                    action={
                        <Button asChild>
                            <Link href="/projects/create">
                                <FolderPlus className="h-4 w-4" /> Tambah Proyek
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Proyek"
                        value={String(stats.total_projects)}
                        icon={Sprout}
                        hint="Proyek lahan aktif"
                    />
                    <StatCard
                        title="Total Prediksi"
                        value={String(stats.total_predictions)}
                        icon={BarChart3}
                        hint="Riwayat estimasi tersimpan"
                    />
                    <Card className="md:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardDescription>Prediksi Terakhir</CardDescription>
                            <CardTitle className="text-2xl text-primary">
                                {stats.latest_prediction
                                    ? `${stats.latest_prediction.estimasi_panen_ton.toFixed(2)} ton`
                                    : 'Belum ada prediksi'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {stats.latest_prediction ? (
                                <>
                                    <StatusBadge status={stats.latest_prediction.status} />
                                    <p className="text-sm text-muted-foreground">
                                        Faktor dominan: {stats.latest_prediction.faktor_dominan}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Mulai dengan menambah proyek lalu input data variabel.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-2xl border border-border bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Ringkasan Evaluasi AI</CardTitle>
                        <CardDescription>{modelEvaluation.engine}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-4">
                        <MiniMetric label="Benchmark" value={`${modelEvaluation.sample_size} sampel`} />
                        <MiniMetric label="MAE Model" value={`${modelEvaluation.model_mae_ton_ha.toFixed(3)} ton/ha`} />
                        <MiniMetric label="MAE Baseline" value={`${modelEvaluation.baseline_mae_ton_ha.toFixed(3)} ton/ha`} />
                        <MiniMetric label="Peningkatan" value={`${modelEvaluation.improvement_percent.toFixed(1)}%`} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Grafik Estimasi Panen</CardTitle>
                            <CardDescription>Data 7 prediksi terakhir</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            {chart.length === 0 ? (
                                <EmptyState
                                    title="Belum ada data grafik"
                                    description="Simpan hasil prediksi pertama Anda untuk melihat visualisasi tren panen."
                                />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#D8E2C3" />
                                        <XAxis dataKey="tanggal" stroke="#647064" fontSize={12} />
                                        <YAxis stroke="#647064" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 16,
                                                border: '1px solid #D8E2C3',
                                                background: '#FFFFFF',
                                            }}
                                        />
                                        <Bar dataKey="estimasi" fill="#2F6B3F" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                            <CardDescription>Jalur utama penggunaan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild className="w-full justify-start">
                                <Link href="/projects/create">
                                    <FolderPlus className="h-4 w-4" /> Tambah Proyek
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" className="w-full justify-start">
                                <Link href="/inputs/create">
                                    <ClipboardPlus className="h-4 w-4" /> Input Data
                                </Link>
                            </Button>
                            <Button asChild variant="accent" className="w-full justify-start">
                                <Link href="/histories">
                                    <Sparkles className="h-4 w-4" /> Lihat Riwayat
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href={stats.latest_prediction ? '/histories' : '/inputs/create'}>
                                    <Sparkles className="h-4 w-4" /> Lihat Rekomendasi
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/settings">Pengaturan</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-5">
                    <Card className="xl:col-span-3 rounded-2xl border border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Riwayat Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentHistories.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada riwayat prediksi.</p>
                            ) : (
                                recentHistories.map((history) => (
                                    <div key={history.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {(history as PredictionHistory & { project?: { nama_tanaman?: string } }).project?.nama_tanaman ?? 'Tanaman'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(history.tanggal_prediksi).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-primary">
                                                {history.estimasi_panen_ton.toFixed(2)} ton
                                            </p>
                                            <StatusBadge status={history.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Rekomendasi Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.latest_recommendation ? (
                                <p className="text-sm leading-7 text-muted-foreground">
                                    {stats.latest_recommendation}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada rekomendasi tersimpan.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};

function MiniMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-semibold text-foreground">{value}</p>
        </div>
    );
}
