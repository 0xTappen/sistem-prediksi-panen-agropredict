import { Head, Link, router } from '@inertiajs/react';
import { Leaf, Pencil, Plus, Search, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Paginated, Project } from '@/types';

type ProjectListItem = Project & {
    input_logs_count: number;
    prediction_histories_count: number;
};

export default function ProjectIndex({
    projects,
    filters,
}: {
    projects: Paginated<ProjectListItem>;
    filters: { q: string };
}) {
    const [deleteTarget, setDeleteTarget] = useState<ProjectListItem | null>(null);
    const [search, setSearch] = useState(filters.q ?? '');

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/projects/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const onSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get('/projects', { q: search }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Proyek Lahan" />
            <div className="space-y-4">
                <PageHeader
                    title="Manajemen Proyek Lahan"
                    description="Kelola daftar proyek pertanian, detail lahan, dan progres prediksi."
                    action={
                        <Button asChild>
                            <Link href="/projects/create">
                                <Plus className="h-4 w-4" /> Tambah Proyek
                            </Link>
                        </Button>
                    }
                />

                <Card className="rounded-2xl border border-border bg-card py-0">
                    <CardContent className="p-4">
                        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama tanaman, jenis, atau lokasi..."
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {projects.data.length === 0 ? (
                    <EmptyState
                        icon={Leaf}
                        title="Belum ada proyek"
                        description="Tambahkan proyek pertama untuk mulai input data dan prediksi panen."
                        actionLabel="Tambah Proyek"
                        onAction={() => router.visit('/projects/create')}
                    />
                ) : (
                    <>
                        <Card className="hidden rounded-2xl border border-border bg-card py-0 md:block">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/70">
                                        <TableRow>
                                            <TableHead className="pl-4">Tanaman</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Luas Lahan</TableHead>
                                            <TableHead>Lokasi</TableHead>
                                            <TableHead>Statistik</TableHead>
                                            <TableHead className="pr-4 text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.data.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell className="pl-4 font-medium">
                                                    <Link href={`/projects/${project.id}`} className="hover:underline">
                                                        {project.nama_tanaman}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{project.jenis_tanaman}</Badge>
                                                </TableCell>
                                                <TableCell>{project.luas_lahan.toFixed(2)} ha</TableCell>
                                                <TableCell>{project.lokasi}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline">Input {project.input_logs_count}</Badge>
                                                        <Badge variant="outline">Prediksi {project.prediction_histories_count}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="outline" asChild>
                                                            <Link href={`/projects/${project.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button size="icon" variant="outline" asChild>
                                                            <Link href={`/projects/${project.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={() => setDeleteTarget(project)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid gap-3 md:hidden">
                            {projects.data.map((project) => (
                                <Card key={project.id} className="rounded-2xl border border-border bg-card py-0">
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                                                    {project.nama_tanaman}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{project.lokasi}</p>
                                            </div>
                                            <Badge variant="secondary">{project.jenis_tanaman}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Luas lahan: {project.luas_lahan.toFixed(2)} ha
                                        </p>
                                        <div className="flex justify-between">
                                            <div className="flex gap-2">
                                                <Badge variant="outline">Input {project.input_logs_count}</Badge>
                                                <Badge variant="outline">Prediksi {project.prediction_histories_count}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/projects/${project.id}`}>
                                                    <Eye className="h-4 w-4" /> Lihat
                                                </Link>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/projects/${project.id}/edit`}>
                                                    <Pencil className="h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setDeleteTarget(project)}
                                            >
                                                <Trash2 className="h-4 w-4" /> Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Hapus proyek?"
                description="Semua input log dan riwayat prediksi terkait proyek ini juga akan terhapus."
                confirmLabel="Ya, Hapus"
                destructive={true}
                onConfirm={handleDelete}
            />
        </>
    );
}

ProjectIndex.layout = {
    breadcrumbs: [{ title: 'Proyek Lahan', href: '/projects' }],
};
