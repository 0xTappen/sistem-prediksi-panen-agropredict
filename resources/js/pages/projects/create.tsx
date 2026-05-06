import { Head, Link, useForm } from '@inertiajs/react';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProjectCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama_tanaman: '',
        jenis_tanaman: '',
        luas_lahan: '',
        lokasi: '',
        latitude: '',
        longitude: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects');
    };

    return (
        <>
            <Head title="Tambah Proyek" />
            <div className="space-y-4">
                <PageHeader
                    title="Tambah Proyek"
                    description="Masukkan data dasar proyek lahan pertanian."
                />

                <form className="space-y-4" onSubmit={submit}>
                    <FormSection title="Informasi Proyek" description="Data utama tanaman dan lokasi lahan.">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_tanaman">Nama Tanaman</Label>
                                <Input
                                    id="nama_tanaman"
                                    value={data.nama_tanaman}
                                    onChange={(e) => setData('nama_tanaman', e.target.value)}
                                />
                                <InputError message={errors.nama_tanaman} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="jenis_tanaman">Jenis Tanaman</Label>
                                    <Input
                                        id="jenis_tanaman"
                                        value={data.jenis_tanaman}
                                        onChange={(e) => setData('jenis_tanaman', e.target.value)}
                                    />
                                    <InputError message={errors.jenis_tanaman} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="luas_lahan">Luas Lahan (ha)</Label>
                                    <Input
                                        id="luas_lahan"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={data.luas_lahan}
                                        onChange={(e) => setData('luas_lahan', e.target.value)}
                                    />
                                    <InputError message={errors.luas_lahan} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lokasi">Lokasi</Label>
                                <Input
                                    id="lokasi"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                />
                                <InputError message={errors.lokasi} />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Koordinat (Opsional)">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="0.0000001"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                />
                                <InputError message={errors.latitude} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="0.0000001"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>
                    </FormSection>

                    <div className="flex flex-wrap gap-2">
                        <Button disabled={processing} type="submit">
                            Simpan Proyek
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/projects">Kembali</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProjectCreate.layout = {
    breadcrumbs: [
        { title: 'Proyek Lahan', href: '/projects' },
        { title: 'Tambah Proyek', href: '/projects/create' },
    ],
};
