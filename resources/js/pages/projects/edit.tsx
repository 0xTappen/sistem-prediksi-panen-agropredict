import { Head, Link, useForm } from '@inertiajs/react';
import FormSection from '@/components/form-section';
import InputError from '@/components/input-error';
import LocationPicker from '@/components/location-picker';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project } from '@/types';

export default function ProjectEdit({ project }: { project: Project }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_tanaman: project.nama_tanaman,
        jenis_tanaman: project.jenis_tanaman,
        luas_lahan: project.luas_lahan.toString(),
        lokasi: project.lokasi,
        latitude: project.latitude?.toString() ?? '',
        longitude: project.longitude?.toString() ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/projects/${project.id}`);
    };

    return (
        <>
            <Head title="Edit Proyek" />
            <div className="space-y-4">
                <PageHeader title="Edit Proyek" description="Perbarui informasi proyek lahan." />

                <form className="space-y-4" onSubmit={submit}>
                    <FormSection title="Informasi Proyek">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_tanaman">Nama Tanaman</Label>
                                <Input id="nama_tanaman" value={data.nama_tanaman} onChange={(e) => setData('nama_tanaman', e.target.value)} />
                                <InputError message={errors.nama_tanaman} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="jenis_tanaman">Jenis Tanaman</Label>
                                    <Input id="jenis_tanaman" value={data.jenis_tanaman} onChange={(e) => setData('jenis_tanaman', e.target.value)} />
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

                            <LocationPicker
                                lokasi={data.lokasi}
                                latitude={data.latitude}
                                longitude={data.longitude}
                                onLokasiChange={(value) => setData('lokasi', value)}
                                onLatitudeChange={(value) => setData('latitude', value)}
                                onLongitudeChange={(value) => setData('longitude', value)}
                                lokasiError={errors.lokasi}
                            />
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
                            Simpan Perubahan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/projects/${project.id}`}>Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProjectEdit.layout = {
    breadcrumbs: [
        { title: 'Proyek Lahan', href: '/projects' },
        { title: 'Edit Proyek', href: '#' },
    ],
};

