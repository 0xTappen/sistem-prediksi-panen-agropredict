import { Head, Link } from '@inertiajs/react';
import { ClipboardPlus, Pencil } from 'lucide-react';
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

export default function ProjectShow({ project }: { project: ProjectDetail }) {
    return (
        <>
            <Head title={`Detail Proyek - ${project.nama_tanaman}`} />
            <div className="space-y-4">
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

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Proyek</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                        <p>Luas Lahan: {project.luas_lahan.toFixed(2)} ha</p>
                        <p>Lokasi: {project.lokasi}</p>
                        <p>Latitude: {project.latitude ?? '-'}</p>
                        <p>Longitude: {project.longitude ?? '-'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Input Terbaru</CardTitle>
                        <CardDescription>Maksimal 5 log input terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {project.input_logs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada input data.</p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/70">
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Sumber Cuaca</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.input_logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>#{log.id}</TableCell>
                                            <TableCell>{log.sumber_cuaca.toUpperCase()}</TableCell>
                                            <TableCell>
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Prediksi Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.prediction_histories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada riwayat prediksi.</p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/70">
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Estimasi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.prediction_histories.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell>
                                                {new Date(history.tanggal_prediksi).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell>{history.estimasi_panen_ton.toFixed(2)} ton</TableCell>
                                            <TableCell>
                                                <StatusBadge status={history.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="outline">
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
        </>
    );
}

ProjectShow.layout = {
    breadcrumbs: [
        { title: 'Proyek Lahan', href: '/projects' },
        { title: 'Detail Proyek', href: '#' },
    ],
};
