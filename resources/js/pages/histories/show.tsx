import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PredictionHistory } from '@/types';

type HistoryDetail = PredictionHistory & {
    project: {
        nama_tanaman: string;
        jenis_tanaman: string;
        luas_lahan: number;
        lokasi: string;
    };
    input_log: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        ph_tanah: number;
        kelembapan_tanah: number;
        jumlah_air: number;
        suhu: number;
        kelembapan_udara: number;
        curah_hujan: number;
        sumber_cuaca: string;
        catatan: string | null;
    };
};

export default function HistoryShow({ history }: { history: HistoryDetail }) {
    const recommendation = history.rekomendasi_json;

    const chartData = [
        { name: 'N', value: history.input_log.nitrogen, fill: '#2F6B3F' },
        { name: 'P', value: history.input_log.phosphorus, fill: '#A7C957' },
        { name: 'K', value: history.input_log.potassium, fill: '#F2B84B' },
    ];

    return (
        <>
            <Head title="Detail Riwayat Prediksi" />
            <div className="space-y-4">
                <PageHeader
                    title="Detail Riwayat Prediksi"
                    description={`${history.project.nama_tanaman} • ${history.lokasi}`}
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <a href={`/histories/${history.id}/export-pdf`}>
                                    <FileText className="h-4 w-4" /> Export PDF
                                </a>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href="/histories">Kembali</Link>
                            </Button>
                        </div>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Prediksi</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                        <Info label="Estimasi Panen" value={`${history.estimasi_panen_ton.toFixed(2)} ton`} />
                        <Info label="Skor Kecocokan" value={history.skor_kecocokan.toFixed(2)} />
                        <div className="rounded-2xl border border-border bg-muted/50 px-3 py-2">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <StatusBadge status={history.status} />
                        </div>
                        <Info label="Faktor Dominan" value={history.faktor_dominan} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <FormSection title="Informasi Proyek">
                        <Info label="Nama Tanaman" value={history.project.nama_tanaman} />
                        <Info label="Jenis Tanaman" value={history.project.jenis_tanaman} />
                        <Info label="Luas Lahan" value={`${history.project.luas_lahan.toFixed(2)} ha`} />
                        <Info label="Lokasi" value={history.project.lokasi} />
                    </FormSection>

                    <FormSection title="Grafik NPK">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#D8E2C3" />
                                    <XAxis dataKey="name" stroke="#647064" />
                                    <YAxis stroke="#647064" />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </FormSection>
                </div>

                <FormSection title="Data Input Pertanian">
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                        <Info label="Nitrogen" value={history.input_log.nitrogen.toFixed(2)} />
                        <Info label="Phosphorus" value={history.input_log.phosphorus.toFixed(2)} />
                        <Info label="Potassium" value={history.input_log.potassium.toFixed(2)} />
                        <Info label="pH Tanah" value={history.input_log.ph_tanah.toFixed(2)} />
                        <Info label="Kelembapan Tanah" value={history.input_log.kelembapan_tanah.toFixed(2)} />
                        <Info label="Jumlah Air" value={history.input_log.jumlah_air.toFixed(2)} />
                    </div>
                </FormSection>

                <FormSection title="Data Cuaca">
                    <div className="grid gap-3 text-sm md:grid-cols-2">
                        <Info label="Suhu" value={`${history.input_log.suhu.toFixed(2)} °C`} />
                        <Info label="Kelembapan Udara" value={`${history.input_log.kelembapan_udara.toFixed(2)} %`} />
                        <Info label="Curah Hujan" value={`${history.input_log.curah_hujan.toFixed(2)} mm`} />
                        <Info label="Sumber Cuaca" value={history.input_log.sumber_cuaca.toUpperCase()} />
                    </div>
                </FormSection>

                <FormSection title="Rekomendasi Pintar">
                    <div className="space-y-2 text-sm text-foreground">
                        <p>Pupuk disarankan: {recommendation.pupuk_disarankan}</p>
                        <p>Waktu tanam terbaik: {recommendation.waktu_tanam_terbaik}</p>
                        <p>Waktu panen prediksi: {recommendation.waktu_panen_prediksi}</p>
                        <p>Pengendalian hama: {recommendation.pengendalian_hama}</p>
                        <p>Catatan risiko: {recommendation.catatan_risiko}</p>
                        {recommendation.insight_model ? (
                            <p>Insight model: {recommendation.insight_model}</p>
                        ) : null}
                        <Separator className="my-3" />
                        <div className="space-y-1">
                            <p className="font-medium">Tips Perawatan</p>
                            {recommendation.tips_perawatan.map((tip, idx) => (
                                <p key={`${idx}-${tip}`}>{idx + 1}. {tip}</p>
                            ))}
                        </div>
                    </div>
                </FormSection>

                {recommendation.simulasi_perbaikan ? (
                    <FormSection title="Simulasi Perbaikan AI">
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <Info label="Fokus Perbaikan" value={recommendation.simulasi_perbaikan.fokus_perbaikan.join(', ')} />
                            <Info label="Estimasi Baru" value={`${recommendation.simulasi_perbaikan.estimasi_baru_ton.toFixed(2)} ton`} />
                            <Info label="Delta Panen" value={`+${recommendation.simulasi_perbaikan.delta_ton.toFixed(2)} ton`} />
                            <Info label="Skor Baru" value={recommendation.simulasi_perbaikan.skor_baru.toFixed(2)} />
                        </div>
                    </FormSection>
                ) : null}
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

HistoryShow.layout = {
    breadcrumbs: [
        { title: 'Riwayat Prediksi', href: '/histories' },
        { title: 'Detail Riwayat', href: '#' },
    ],
};
