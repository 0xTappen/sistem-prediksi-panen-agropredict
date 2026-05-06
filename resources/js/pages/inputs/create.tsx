import { Head, Link, router, useForm } from '@inertiajs/react';
import { CloudSun, Droplets, FlaskConical, Sprout } from 'lucide-react';
import { useEffect } from 'react';
import type { ComponentType } from 'react';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/types';

type WeatherData = {
    suhu: number;
    kelembapan_udara: number;
    curah_hujan: number;
    sumber_cuaca?: string;
} | null;

export default function InputCreate({
    projects,
    selectedProject,
    weatherData,
    weatherError,
}: {
    projects: Project[];
    selectedProject: Project | null;
    weatherData: WeatherData;
    weatherError: string | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        project_id: selectedProject?.id?.toString() ?? '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        ph_tanah: '',
        kelembapan_tanah: '',
        jumlah_air: '',
        suhu: weatherData?.suhu?.toString() ?? '',
        kelembapan_udara: weatherData?.kelembapan_udara?.toString() ?? '',
        curah_hujan: weatherData?.curah_hujan?.toString() ?? '',
        sumber_cuaca: weatherData?.sumber_cuaca ?? (weatherData ? 'api' : 'manual'),
        catatan: '',
    });

    useEffect(() => {
        if (!weatherData) {
            return;
        }

        setData((current) => ({
            ...current,
            suhu: weatherData.suhu.toString(),
            kelembapan_udara: weatherData.kelembapan_udara.toString(),
            curah_hujan: weatherData.curah_hujan.toString(),
            sumber_cuaca: weatherData.sumber_cuaca ?? 'api',
        }));
    }, [setData, weatherData]);

    const handleProjectChange = (value: string) => {
        setData('project_id', value);

        router.get('/inputs/create', { project_id: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inputs');
    };

    return (
        <>
            <Head title="Input Data Variabel" />
            <div className="space-y-4">
                <PageHeader
                    title="Input Data Variabel"
                    description="Isi data pupuk, tanah, air, dan cuaca untuk memproses prediksi panen."
                />

                <form className="space-y-4" onSubmit={submit}>
                    <FormSection title="1. Pilih Proyek" description="Pilih proyek lahan yang akan dianalisis.">
                        <Select value={data.project_id} onValueChange={handleProjectChange}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Pilih proyek" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.nama_tanaman} - {project.lokasi}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.project_id} />

                        {selectedProject ? (
                            <div className="rounded-2xl border border-border bg-muted/60 p-4 text-sm">
                                <p className="font-medium text-foreground">{selectedProject.nama_tanaman}</p>
                                <p className="text-muted-foreground">
                                    {selectedProject.jenis_tanaman} • {selectedProject.lokasi} • {selectedProject.luas_lahan.toFixed(2)} ha
                                </p>
                            </div>
                        ) : (
                            <Alert>
                                <AlertTitle>Belum ada proyek dipilih</AlertTitle>
                                <AlertDescription>
                                    Pilih salah satu proyek untuk melanjutkan input data.
                                </AlertDescription>
                            </Alert>
                        )}
                    </FormSection>

                    <FormSection title="2. Data Pupuk" description="Masukkan komposisi unsur hara N, P, K.">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field id="nitrogen" label="Nitrogen (N)" value={data.nitrogen} onChange={(value) => setData('nitrogen', value)} error={errors.nitrogen} icon={FlaskConical} />
                            <Field id="phosphorus" label="Phosphorus (P)" value={data.phosphorus} onChange={(value) => setData('phosphorus', value)} error={errors.phosphorus} icon={FlaskConical} />
                            <Field id="potassium" label="Potassium (K)" value={data.potassium} onChange={(value) => setData('potassium', value)} error={errors.potassium} icon={FlaskConical} />
                        </div>
                    </FormSection>

                    <FormSection title="3. Data Tanah" description="Kondisi pH dan kelembapan tanah saat pengukuran.">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field id="ph_tanah" label="pH Tanah" value={data.ph_tanah} onChange={(value) => setData('ph_tanah', value)} error={errors.ph_tanah} icon={Sprout} />
                            <Field id="kelembapan_tanah" label="Kelembapan Tanah" value={data.kelembapan_tanah} onChange={(value) => setData('kelembapan_tanah', value)} error={errors.kelembapan_tanah} icon={Sprout} />
                        </div>
                    </FormSection>

                    <FormSection title="4. Data Air" description="Jumlah ketersediaan air untuk lahan.">
                        <Field id="jumlah_air" label="Jumlah Air" value={data.jumlah_air} onChange={(value) => setData('jumlah_air', value)} error={errors.jumlah_air} icon={Droplets} />
                    </FormSection>

                    <FormSection title="5. Data Cuaca" description="Data cuaca otomatis dari API atau manual fallback.">
                        {weatherData ? (
                            <Alert>
                                <AlertTitle className="flex items-center gap-2">
                                    <CloudSun className="h-4 w-4" /> Cuaca dari API tersedia
                                </AlertTitle>
                                <AlertDescription>
                                    Nilai suhu, kelembapan udara, dan curah hujan terisi otomatis.
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {weatherError ? (
                            <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                                <AlertTitle>Gagal mengambil cuaca API</AlertTitle>
                                <AlertDescription>{weatherError}. Silakan isi data cuaca manual.</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-3">
                            <Field id="suhu" label="Suhu (°C)" value={data.suhu} onChange={(value) => setData('suhu', value)} error={errors.suhu} icon={CloudSun} />
                            <Field id="kelembapan_udara" label="Kelembapan Udara (%)" value={data.kelembapan_udara} onChange={(value) => setData('kelembapan_udara', value)} error={errors.kelembapan_udara} icon={CloudSun} />
                            <Field id="curah_hujan" label="Curah Hujan (mm)" value={data.curah_hujan} onChange={(value) => setData('curah_hujan', value)} error={errors.curah_hujan} icon={CloudSun} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label>Sumber Cuaca</Label>
                            {data.sumber_cuaca === 'api' ? (
                                <Badge className="bg-emerald-600 text-white">API</Badge>
                            ) : (
                                <Badge className="bg-amber-500 text-white">MANUAL</Badge>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setData('sumber_cuaca', data.sumber_cuaca === 'api' ? 'manual' : 'api')}
                            >
                                Ganti
                            </Button>
                        </div>
                        <InputError message={errors.sumber_cuaca} />
                    </FormSection>

                    <FormSection title="Catatan Tambahan" description="Opsional, untuk konteks tambahan.">
                        <Textarea
                            id="catatan"
                            value={data.catatan}
                            onChange={(e) => setData('catatan', e.target.value)}
                            placeholder="Contoh: kondisi daun menguning, irigasi baru dilakukan, dsb."
                        />
                        <InputError message={errors.catatan} />
                    </FormSection>

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={processing || data.project_id.length === 0}>
                            Simpan & Prediksi
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">Kembali</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function Field({
    id,
    label,
    value,
    onChange,
    error,
    icon: Icon,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    icon?: ComponentType<{ className?: string }>;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="inline-flex items-center gap-2">
                {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
                {label}
            </Label>
            <Input id={id} type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} />
            <InputError message={error} />
        </div>
    );
}

InputCreate.layout = {
    breadcrumbs: [{ title: 'Input Data Variabel', href: '/inputs/create' }],
};
