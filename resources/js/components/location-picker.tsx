import { LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LocationSuggestion = {
    label: string;
    latitude: number;
    longitude: number;
};

type Props = {
    lokasi: string;
    latitude: string;
    longitude: string;
    onLokasiChange: (value: string) => void;
    onLatitudeChange: (value: string) => void;
    onLongitudeChange: (value: string) => void;
    lokasiError?: string;
};

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

function parseCoordinate(value: string): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

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

export default function LocationPicker({
    lokasi,
    latitude,
    longitude,
    onLokasiChange,
    onLatitudeChange,
    onLongitudeChange,
    lokasiError,
}: Props) {
    const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationLookupError, setLocationLookupError] = useState('');
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [isReverseLoading, setIsReverseLoading] = useState(false);
    const [mapError, setMapError] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipNextLookupRef = useRef(false);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const reverseRequestRef = useRef(0);

    const applyCoordinates = (lat: number, lon: number, reverseLookup = true) => {
        onLatitudeChange(lat.toFixed(7));
        onLongitudeChange(lon.toFixed(7));

        if (reverseLookup) {
            void reverseGeocode(lat, lon);
        }
    };

    const reverseGeocode = async (lat: number, lon: number) => {
        const requestId = ++reverseRequestRef.current;
        setIsReverseLoading(true);
        setMapError('');

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
            if (label) {
                skipNextLookupRef.current = true;
                onLokasiChange(label);
            }
        } catch (error) {
            if (requestId !== reverseRequestRef.current) {
                return;
            }
            const message = error instanceof Error ? error.message : 'Gagal mengambil nama lokasi.';
            setMapError(message);
        } finally {
            if (requestId === reverseRequestRef.current) {
                setIsReverseLoading(false);
            }
        }
    };

    const attachOrMoveMarker = (lat: number, lon: number, map: any, L: LeafletLike) => {
        if (!markerRef.current) {
            markerRef.current = L.marker([lat, lon], { draggable: true }).addTo(map);
            markerRef.current.on('dragend', () => {
                const ll = markerRef.current.getLatLng();
                applyCoordinates(ll.lat, ll.lng, true);
            });
            return;
        }

        markerRef.current.setLatLng([lat, lon]);
    };

    useEffect(() => {
        const query = lokasi.trim();

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
    }, [lokasi]);

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

                const lat = parseCoordinate(latitude) ?? -6.2;
                const lon = parseCoordinate(longitude) ?? 106.8166667;
                const zoom = parseCoordinate(latitude) !== null && parseCoordinate(longitude) !== null ? 13 : 6;

                if (!mapRef.current) {
                    const L = window.L;
                    const map = L.map(mapContainerRef.current).setView([lat, lon], zoom);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    map.on('click', (event: any) => {
                        const clickedLat = event.latlng.lat as number;
                        const clickedLon = event.latlng.lng as number;
                        attachOrMoveMarker(clickedLat, clickedLon, map, L);
                        applyCoordinates(clickedLat, clickedLon, true);
                    });

                    mapRef.current = map;
                    attachOrMoveMarker(lat, lon, map, L);
                } else {
                    mapRef.current.setView([lat, lon], zoom);
                    if (window.L) {
                        attachOrMoveMarker(lat, lon, mapRef.current, window.L);
                    }
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
    }, [isMapOpen, latitude, longitude]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    const selectLocation = (item: LocationSuggestion) => {
        skipNextLookupRef.current = true;
        onLokasiChange(item.label);
        onLatitudeChange(String(item.latitude));
        onLongitudeChange(String(item.longitude));
        setLocationSuggestions([]);
        setLocationLookupError('');
        setShowLocationDropdown(false);

        if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([item.latitude, item.longitude]);
            mapRef.current.setView([item.latitude, item.longitude], 14);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMapError('Browser Anda tidak mendukung fitur lokasi.');
            return;
        }

        setIsLocating(true);
        setMapError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                applyCoordinates(lat, lon, true);

                if (mapRef.current && markerRef.current) {
                    markerRef.current.setLatLng([lat, lon]);
                    mapRef.current.setView([lat, lon], 15);
                }

                setIsLocating(false);
                if (!isMapOpen) {
                    setIsMapOpen(true);
                }
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

    return (
        <div className="relative grid gap-2">
            <Label htmlFor="lokasi">Lokasi</Label>
            <Input
                id="lokasi"
                value={lokasi}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => {
                    setTimeout(() => setShowLocationDropdown(false), 150);
                }}
                onChange={(e) => {
                    const value = e.target.value;
                    onLokasiChange(value);
                    if (value.trim() === '') {
                        onLatitudeChange('');
                        onLongitudeChange('');
                    }
                }}
                placeholder="Ketik lokasi, misalnya: Bekasi, Bandung, Surabaya"
            />
            <p className="text-xs text-muted-foreground">
                Ketik minimal 3 huruf untuk saran otomatis, atau pilih titik langsung di peta agar lebih presisi.
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
                                        <Search className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span className="line-clamp-2">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-1 flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsMapOpen((prev) => !prev)}>
                    <MapPin className="h-4 w-4" />
                    {isMapOpen ? 'Tutup Peta' : 'Pilih di Peta'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation} disabled={isLocating}>
                    {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                    Lokasi Saya
                </Button>
                {isReverseLoading ? <span className="text-xs text-muted-foreground">Menyinkronkan nama lokasi...</span> : null}
            </div>

            {isMapOpen ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
                    {isMapLoading ? (
                        <div className="flex h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Memuat peta...
                        </div>
                    ) : null}
                    <div ref={mapContainerRef} className="h-72 w-full" />
                    <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                        Geser peta lalu klik titik, atau drag marker untuk memilih lokasi yang tepat.
                    </div>
                </div>
            ) : null}

            {mapError !== '' ? <p className="text-xs text-destructive">{mapError}</p> : null}
            <InputError message={lokasiError} />
        </div>
    );
}

