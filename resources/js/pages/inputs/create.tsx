import { Head, Link, router, useForm } from '@inertiajs/react';
import { CloudSun, Droplets, FlaskConical, LoaderCircle, LocateFixed, MapPin, Search, Sprout } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import FormSection from '@/components/form-section';
import PageHeader from '@/components/page-header';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

type LeafletLike = {
    map: (element: HTMLElement) => any;
    tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: any) => void };
    marker: (latLng: [number, number], options: Record<string, unknown>) => any;
};

declare global {
    interface Window {
        L?: LeafletLike;
    }
}

const LEAFLET_CSS_ID = 'leaflet-css-cdn';
const LEAFLET_SCRIPT_ID = 'leaflet-js-cdn';

function ensureLeafletAssets(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Leaflet hanya tersedia di browser.'));
            return;
        }

        if (!document.getElementById(LEAFLET_CSS_ID)) {
            const css = document.createElement('link');
            css.id = LEAFLET_CSS_ID;
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);
        }

        if (window.L) {
            resolve();
            return;
        }

        const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Leaflet.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = LEAFLET_SCRIPT_ID;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat Leaflet.'));
        document.body.appendChild(script);
    });
}

export default function InputCreate({
    projects,
    selectedProject,
    weatherData,
    weatherError,
    weatherLocationUsed,
    locationOverride,
}: {
    projects: Project[];
    selectedProject: Project | null;
    weatherData: WeatherData;
    weatherError: string | null;
    weatherLocationUsed: string | null;
    locationOverride: string;
}) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [isReverseLoading, setIsReverseLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mapError, setMapError] = useState('');
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLon, setSelectedLon] = useState<number | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const reverseRequestRef = useRef(0);

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
        lokasi_cuaca: locationOverride || selectedProject?.lokasi || '',
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

    useEffect(() => {
        setData('lokasi_cuaca', locationOverride || selectedProject?.lokasi || '');
    }, [locationOverride, selectedProject?.id, selectedProject?.lokasi, setData]);

    useEffect(() => {
        if (!isMapOpen) {
            return;
        }

        let isActive = true;

        const initMap = async () => {
            setIsMapLoading(true);
            setMapError('');

            try {
                await ensureLeafletAssets();
                if (!isActive) {
                    return;
                }

                if (!mapContainerRef.current || !window.L) {
                    throw new Error('Kontainer peta tidak tersedia.');
                }

                const locationLat = selectedLat ?? -6.2;
                const locationLon = selectedLon ?? 106.8166667;
                const zoom = selectedLat !== null && selectedLon !== null ? 11 : 6;

                if (!mapRef.current) {
                    const L = window.L;
                    const map = L.map(mapContainerRef.current).setView([locationLat, locationLon], zoom);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    markerRef.current = L.marker([locationLat, locationLon], { draggable: true }).addTo(map);
                    markerRef.current.on('dragend', () => {
                        const ll = markerRef.current.getLatLng();
                        void setWeatherLocationFromCoordinates(ll.lat, ll.lng);
                    });

                    map.on('click', (event: any) => {
                        const clickedLat = event.latlng.lat as number;
                        const clickedLon = event.latlng.lng as number;
                        markerRef.current.setLatLng([clickedLat, clickedLon]);
                        void setWeatherLocationFromCoordinates(clickedLat, clickedLon);
                    });

                    mapRef.current = map;
                } else {
                    mapRef.current.setView([locationLat, locationLon], zoom);
                    markerRef.current?.setLatLng([locationLat, locationLon]);
                    setTimeout(() => mapRef.current?.invalidateSize(), 80);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Gagal memuat peta.';
                setMapError(message);
            } finally {
                if (isActive) {
                    setIsMapLoading(false);
                }
            }
        };

        void initMap();

        return () => {
            isActive = false;
        };
    }, [isMapOpen, selectedLat, selectedLon]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

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

    const setWeatherLocationFromCoordinates = async (lat: number, lon: number) => {
        setSelectedLat(lat);
        setSelectedLon(lon);
        setMapError('');
        setIsReverseLoading(true);
        const requestId = ++reverseRequestRef.current;

        try {
            const response = await fetch(`/locations/reverse?lat=${lat}&lon=${lon}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            const payload = (await response.json()) as {
                data?: { label?: string | null };
                errors?: { lat?: string[] };
                message?: string;
            };

            if (!response.ok) {
                const message = payload.errors?.lat?.[0] ?? payload.message ?? 'Gagal mengambil nama lokasi.';
                throw new Error(message);
            }

            if (requestId !== reverseRequestRef.current) {
                return;
            }

            const label = payload.data?.label?.trim();
            setData('lokasi_cuaca', label || `${lat.toFixed(7)}, ${lon.toFixed(7)}`);
        } catch (error) {
            if (requestId !== reverseRequestRef.current) {
                return;
            }
            const message = error instanceof Error ? error.message : 'Gagal mengambil nama lokasi.';
            setMapError(message);
            setData('lokasi_cuaca', `${lat.toFixed(7)}, ${lon.toFixed(7)}`);
        } finally {
            if (requestId === reverseRequestRef.current) {
                setIsReverseLoading(false);
            }
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMapError('Browser tidak mendukung lokasi GPS.');
            return;
        }

        setIsLocating(true);
        setMapError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                if (!isMapOpen) {
                    setIsMapOpen(true);
                }
                if (markerRef.current && mapRef.current) {
                    markerRef.current.setLatLng([lat, lon]);
                    mapRef.current.setView([lat, lon], 14);
                }
                void setWeatherLocationFromCoordinates(lat, lon);
                setIsLocating(false);
            },
            () => {
                setMapError('Izin lokasi ditolak atau tidak tersedia.');
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            },
        );
    };

    const fetchWeatherByLocation = () => {
        if (data.lokasi_cuaca.trim().length === 0) {
            return;
        }

        const query: Record<string, string> = {
            location_override: data.lokasi_cuaca,
        };

        if (selectedLat !== null && selectedLon !== null) {
            query.weather_latitude = selectedLat.toString();
            query.weather_longitude = selectedLon.toString();
        }

        if (data.project_id) {
            query.project_id = data.project_id;
        }

        router.get('/inputs/create', {
            ...query,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
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
                                    Nilai suhu, kelembapan udara, dan curah hujan terisi otomatis dari API.
                                    {weatherLocationUsed ? ` Lokasi dipakai: ${weatherLocationUsed}.` : ''}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {weatherError ? (
                            <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                                <AlertTitle>Gagal mengambil cuaca API</AlertTitle>
                                <AlertDescription>{weatherError}. Silakan isi data cuaca manual.</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="grid gap-2">
                            <Label htmlFor="lokasi_cuaca" className="inline-flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Lokasi Cuaca
                            </Label>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                <Input
                                    id="lokasi_cuaca"
                                    value={data.lokasi_cuaca}
                                    onChange={(e) => setData('lokasi_cuaca', e.target.value)}
                                    placeholder="Contoh: Bandung atau 31.71.03.1001 - Kemayoran"
                                />
                                <div className="flex items-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={fetchWeatherByLocation}
                                        disabled={data.lokasi_cuaca.trim().length === 0}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        Cari Cuaca
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Boleh isi nama lokasi biasa. Jika ada kode ADM4 BMKG, hasil biasanya lebih akurat.
                                Data cuaca bisa diambil meski proyek belum dipilih.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsMapOpen((prev) => !prev)}>
                                    <MapPin className="h-4 w-4" />
                                    {isMapOpen ? 'Tutup Peta' : 'Pilih di Peta'}
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation} disabled={isLocating}>
                                    {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                                    Lokasi Saya
                                </Button>
                                {isReverseLoading ? <span className="text-xs text-muted-foreground">Menyinkronkan lokasi...</span> : null}
                            </div>
                            {isMapOpen ? (
                                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                                    {isMapLoading ? (
                                        <div className="flex h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Memuat peta...
                                        </div>
                                    ) : null}
                                    <div ref={mapContainerRef} className="h-72 w-full" />
                                    <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                                        Geser peta lalu klik titik, atau drag marker untuk menentukan lokasi cuaca.
                                    </div>
                                </div>
                            ) : null}
                            {mapError !== '' ? <p className="text-xs text-destructive">{mapError}</p> : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Field id="suhu" label="Suhu (°C)" value={data.suhu} onChange={(value) => setData('suhu', value)} error={errors.suhu} icon={CloudSun} />
                            <Field id="kelembapan_udara" label="Kelembapan Udara (%)" value={data.kelembapan_udara} onChange={(value) => setData('kelembapan_udara', value)} error={errors.kelembapan_udara} icon={CloudSun} />
                            <Field id="curah_hujan" label="Curah Hujan (mm)" value={data.curah_hujan} onChange={(value) => setData('curah_hujan', value)} error={errors.curah_hujan} icon={CloudSun} />
                        </div>

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
