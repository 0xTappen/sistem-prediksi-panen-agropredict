import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Eye, Filter, History, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Paginated, PredictionHistory } from '@/types';

type HistoryListItem = PredictionHistory & {
    project: {
        nama_tanaman: string;
        lokasi: string;
    };
};

export default function HistoryIndex({
    histories,
    filters,
}: {
    histories: Paginated<HistoryListItem>;
    filters: { q: string; status: string };
}) {
    const page = usePage();
    const params = new URLSearchParams(page.url.split('?')[1] ?? '');
    const menu = params.get('menu') ?? '';
    const [deleteTarget, setDeleteTarget] = useState<HistoryListItem | null>(null);
    const [search, setSearch] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/histories/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const applyFilter = (event?: React.FormEvent) => {
        event?.preventDefault();
        router.get(
            '/histories',
            {
                menu,
                q: search,
                status: status === 'all' ? '' : status,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Riwayat Prediksi" />
            <div className="space-y-4">
                <PageHeader
                    title="Riwayat & Arsip Prediksi"
                    description="Lihat, filter, hapus, dan export laporan prediksi panen."
                />

                <Card className="rounded-2xl border border-border bg-card py-0">
                    <CardContent className="p-4">
                        <form className="grid gap-2 md:grid-cols-6" onSubmit={applyFilter}>
                            <div className="relative md:col-span-4">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari tanaman atau lokasi..."
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value);
                                    router.get(
                                        '/histories',
                                        {
                                            menu,
                                            q: search,
                                            status: value === 'all' ? '' : value,
                                        },
                                        { preserveState: true, replace: true },
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full bg-white md:col-span-1">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="tinggi">Tinggi</SelectItem>
                                    <SelectItem value="sedang">Sedang</SelectItem>
                                    <SelectItem value="rendah">Rendah</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" className="md:col-span-1">
                                <Filter className="h-4 w-4" /> Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {histories.data.length === 0 ? (
                    <EmptyState
                        icon={History}
                        title="Belum ada riwayat prediksi"
                        description="Simpan hasil prediksi untuk membangun arsip dan laporan panen."
                    />
                ) : (
                    <Card className="rounded-2xl border border-border bg-card py-0">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/70">
                                    <TableRow>
                                        <TableHead className="pl-4">Tanaman</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead>Estimasi</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="pr-4 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {histories.data.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell className="pl-4 font-medium">
                                                {history.project?.nama_tanaman ?? '-'}
                                            </TableCell>
                                            <TableCell>{history.lokasi}</TableCell>
                                            <TableCell>
                                                {history.estimasi_panen_ton.toFixed(2)} ton
                                            </TableCell>
                                            <TableCell>
                                                {new Date(history.tanggal_prediksi).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={history.status} />
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" asChild>
                                                        <Link href={`/histories/${history.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="icon" variant="outline" asChild>
                                                        <a href={`/histories/${history.id}/export-pdf`}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => setDeleteTarget(history)}
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
                )}
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Hapus riwayat prediksi?"
                description="Data yang dihapus tidak dapat dipulihkan kembali."
                confirmLabel="Ya, Hapus"
                destructive={true}
                onConfirm={handleDelete}
            />
        </>
    );
}

HistoryIndex.layout = {
    breadcrumbs: [{ title: 'Riwayat Prediksi', href: '/histories' }],
};
