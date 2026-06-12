import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ClipboardPlus, Pencil, LayoutDashboard, DollarSign, CalendarDays, 
    TrendingUp, CheckCircle2, Circle 
} from 'lucide-react';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Project } from '@/types';

type ProjectDetail = Project & {
    input_logs: Array<{ id: number; created_at: string; sumber_cuaca: string }>;
    prediction_histories: Array<{
        id: number;
        estimasi_panen_ton: number;
        status: string;
        tanggal_prediksi: string;
    }>;
};

function FinancialTab({ project }: { project: ProjectDetail }) {
    const latestPrediction = project.prediction_histories[0]?.estimasi_panen_ton ?? 0;
    const [price, setPrice] = useState(5000);
    const [cost, setCost] = useState(10000000);

    const grossRevenue = latestPrediction * 1000 * price;
    const netProfit = grossRevenue - cost;
    const roi = cost > 0 ? (netProfit / cost) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="app-surface">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Kalkulator Finansial</CardTitle>
                    <CardDescription>Simulasi pendapatan berdasarkan estimasi panen terakhir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estimasi Harga Jual (Rp/kg)</label>
                        <input 
                            type="number" 
                            className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                            value={price} 
                            onChange={(e) => setPrice(Number(e.target.value))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estimasi Total Modal Operasional (Rp)</label>
                        <input 
                            type="number" 
                            className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                            value={cost} 
                            onChange={(e) => setCost(Number(e.target.value))} 
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="app-surface bg-gradient-to-br from-card to-muted/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" /> Hasil ROI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Prediksi Panen Terakhir</p>
                        <p className="text-2xl font-bold">{latestPrediction.toFixed(2)} Ton <span className="text-sm font-normal text-muted-foreground">({(latestPrediction * 1000).toLocaleString('id-ID')} kg)</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Pendapatan Kotor (Gross Revenue)</p>
                        <p className="text-2xl font-bold text-primary">Rp {grossRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Keuntungan Bersih (Net Profit)</p>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            Rp {netProfit.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                        <p className="text-sm font-medium">Return on Investment (ROI)</p>
                        <p className={`text-3xl font-black ${roi >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CalendarTab({ project }: { project: ProjectDetail }) {
    const startDate = new Date(project.created_at);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    const schedule = [
        { day: 0, title: 'Persiapan & Penanaman', desc: 'Pembuatan bedengan dan penanaman benih awal.' },
        { day: 15, title: 'Pemupukan Tahap 1', desc: 'Pemberian pupuk dasar (Nitrogen tinggi) untuk pertumbuhan vegetatif.' },
        { day: 30, title: 'Penyiangan Gulma', desc: 'Pembersihan gulma dan hama di sekitar area tanam.' },
        { day: 50, title: 'Pemupukan Tahap 2', desc: 'Pemberian pupuk lanjutan (Fosfor & Kalium) untuk persiapan pembuahan.' },
        { day: 95, title: 'Masa Panen', desc: 'Estimasi panen dimulai berdasarkan rata-rata umur tanaman.' },
    ];

    return (
        <Card className="app-surface">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Smart Farming Timeline</CardTitle>
                <CardDescription>
                    Umur tanaman: <strong className="text-foreground">{diffDays} Hari</strong> (Ditanam: {startDate.toLocaleDateString('id-ID')})
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-border ml-4 mt-4 space-y-8 pb-4">
                    {schedule.map((item, index) => {
                        const isPast = diffDays >= item.day;
                        const isCurrent = diffDays >= item.day && (index === schedule.length - 1 || diffDays < schedule[index + 1].day);
                        
                        return (
                            <div key={item.day} className="relative pl-8">
                                <span className={`absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-card
                                    ${isCurrent ? 'bg-accent text-accent-foreground animate-pulse' : isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                                `}>
                                    {isPast && !isCurrent ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                                </span>
                                <div className="space-y-1">
                                    <h3 className={`font-bold text-lg ${isCurrent ? 'text-accent' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {item.title} <span className="text-sm font-normal opacity-70">(Hari ke-{item.day})</span>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProjectShow({ project }: { project: ProjectDetail }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'calendar'>('overview');

    return (
        <>
            <Head title={`Detail Proyek - ${project.nama_tanaman}`} />
            <div className="space-y-6">
                <PageHeader
                    title={project.nama_tanaman}
                    description={`${project.jenis_tanaman} • ${project.lokasi}`}
                    action={
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/projects/${project.id}/edit`}>
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/inputs/create?project_id=${project.id}`}>
                                    <ClipboardPlus className="h-4 w-4" /> Input Data
                                </Link>
                            </Button>
                        </div>
                    }
                />

                {/* Custom Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                    >
                        <LayoutDashboard className="h-4 w-4" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'financial' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                    >
                        <DollarSign className="h-4 w-4" /> Finansial & ROI
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                    >
                        <CalendarDays className="h-4 w-4" /> Kalender Tanam
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="app-surface md:col-span-2">
                            <CardHeader>
                                <CardTitle>Informasi Proyek</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm md:grid-cols-4">
                                <div><p className="text-muted-foreground">Luas Lahan</p><p className="font-semibold">{project.luas_lahan.toFixed(2)} ha</p></div>
                                <div><p className="text-muted-foreground">Lokasi</p><p className="font-semibold">{project.lokasi}</p></div>
                                <div><p className="text-muted-foreground">Latitude</p><p className="font-semibold">{project.latitude ?? '-'}</p></div>
                                <div><p className="text-muted-foreground">Longitude</p><p className="font-semibold">{project.longitude ?? '-'}</p></div>
                            </CardContent>
                        </Card>

                        <Card className="app-surface">
                            <CardHeader>
                                <CardTitle>Input Terbaru</CardTitle>
                                <CardDescription>Maksimal 5 log input terakhir</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {project.input_logs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Belum ada input data.</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Sumber Cuaca</TableHead>
                                                <TableHead className="text-right">Tanggal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {project.input_logs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.sumber_cuaca.toUpperCase()}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleDateString('id-ID')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="app-surface">
                            <CardHeader>
                                <CardTitle>Riwayat Prediksi Terbaru</CardTitle>
                                <CardDescription>Data historis kalkulasi AI</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {project.prediction_histories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Belum ada riwayat prediksi.</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Estimasi</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {project.prediction_histories.map((history) => (
                                                <TableRow key={history.id}>
                                                    <TableCell className="font-bold">{history.estimasi_panen_ton.toFixed(2)} ton</TableCell>
                                                    <TableCell><StatusBadge status={history.status} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild size="sm" variant="outline" className="h-8">
                                                            <Link href={`/histories/${history.id}`}>Lihat</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'financial' && <FinancialTab project={project} />}
                {activeTab === 'calendar' && <CalendarTab project={project} />}
            </div>
        </>
    );
}

ProjectShow.layout = {
    breadcrumbs: [
        { title: 'Proyek Lahan', href: '/projects' },
        { title: 'Detail Proyek', href: '#' },
    ],
};

