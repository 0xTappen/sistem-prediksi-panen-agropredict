import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FormSection from '@/components/form-section';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LocationSuggestion = {
    label: string;
    latitude: number;
    longitude: number;
};

export default function ProjectCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama_tanaman: '',
        jenis_tanaman: '',
        luas_lahan: '',
        lokasi: '',
        latitude: '',
        longitude: '',
    });

    const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationLookupError, setLocationLookupError] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipNextLookupRef = useRef(false);

    useEffect(() => {
        const query = data.lokasi.trim();

        if (skipNextLookupRef.current) {
            skipNextLookupRef.current = false;
            return;
        }

        if (query.length < 3) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            setLocationSuggestions([]);
            setIsSearchingLocation(false);
            setLocationLookupError('');
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setIsSearchingLocation(true);
        setLocationLookupError('');

        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/locations/search?q=${encodeURIComponent(query)}&limit=5`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const payload = (await response.json()) as {
                    data?: LocationSuggestion[];
                    message?: string;
                    errors?: { q?: string[] };
                };

                if (!response.ok) {
                    const message = payload.errors?.q?.[0] ?? payload.message ?? 'Gagal mencari lokasi.';
                    throw new Error(message);
                }

                setLocationSuggestions(payload.data ?? []);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Gagal mencari lokasi.';
                setLocationLookupError(message);
                setLocationSuggestions([]);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 350);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [data.lokasi]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects');
    };

    const selectLocation = (item: LocationSuggestion) => {
        skipNextLookupRef.current = true;
        setData('lokasi', item.label);
        setData('latitude', String(item.latitude));
        setData('longitude', String(item.longitude));
        setLocationSuggestions([]);
        setLocationLookupError('');
        setShowLocationDropdown(false);
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

                            <div className="relative grid gap-2">
                                <Label htmlFor="lokasi">Lokasi</Label>
                                <Input
                                    id="lokasi"
                                    value={data.lokasi}
                                    onFocus={() => setShowLocationDropdown(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowLocationDropdown(false), 150);
                                    }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setData('lokasi', value);
                                        if (value.trim() === '') {
                                            setData('latitude', '');
                                            setData('longitude', '');
                                        }
                                    }}
                                    placeholder="Ketik lokasi, misalnya: Bekasi, Bandung, Surabaya"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ketik minimal 3 huruf. Pilih hasil saran untuk mengisi koordinat otomatis (tanpa buka Google Maps).
                                </p>
                                {showLocationDropdown && (isSearchingLocation || locationSuggestions.length > 0 || locationLookupError !== '') ? (
                                    <div className="absolute top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                                        {isSearchingLocation ? (
                                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Mencari lokasi...
                                            </div>
                                        ) : null}

                                        {!isSearchingLocation && locationLookupError !== '' ? (
                                            <p className="px-3 py-2 text-sm text-destructive">{locationLookupError}</p>
                                        ) : null}

                                        {!isSearchingLocation && locationLookupError === '' && locationSuggestions.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">Lokasi tidak ditemukan.</p>
                                        ) : null}

                                        {!isSearchingLocation && locationSuggestions.length > 0 ? (
                                            <ul className="max-h-64 overflow-y-auto py-1">
                                                {locationSuggestions.map((item, index) => (
                                                    <li key={`${item.latitude}-${item.longitude}-${index}`}>
                                                        <button
                                                            type="button"
                                                            className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            onClick={() => selectLocation(item)}
                                                        >
                                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                            <span className="line-clamp-2">{item.label}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                ) : null}
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

