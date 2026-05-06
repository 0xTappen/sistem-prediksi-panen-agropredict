import { Head, Link } from '@inertiajs/react';
import { CloudSun, Leaf, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { InputLog, Prediction, Project, Recommendation } from '@/types';

export default function RecommendationShow({
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
                        <StatusBadge status={prediction.status} />
                        <p>{recommendation.ringkasan_status}</p>
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
