import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, LoaderCircle, Layers } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/types';

type LeafletLike = {
    map: (element: HTMLElement) => any;
    tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: any) => void };
    marker: (latLng: [number, number], options: Record<string, unknown>) => { bindPopup: (html: string) => any; addTo: (map: any) => void };
    icon: (options: Record<string, unknown>) => any;
    layerGroup: (layers?: any[]) => any;
    control: { layers: (baseLayers?: any, overlays?: any, options?: any) => { addTo: (map: any) => void } };
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

// Dummy coordinates for projects that don't have lat/lon in DB
const getDummyCoordinates = (index: number): [number, number] => {
    const baseLat = -6.2;
    const baseLon = 106.8;
    return [baseLat + (index * 0.05), baseLon + (index * 0.05)];
};

export default function GISDashboard({ projects }: { projects: Project[] }) {
    const [isMapLoading, setIsMapLoading] = useState(true);
    const [mapError, setMapError] = useState('');
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        let isActive = true;

        const initMap = async () => {
            try {
                await ensureLeafletAssets();
                if (!isActive) return;

                if (!mapContainerRef.current || !window.L) {
                    throw new Error('Kontainer peta tidak tersedia.');
                }

                if (!mapRef.current) {
                    const L = window.L;
                    const map = L.map(mapContainerRef.current).setView([-6.2, 106.8], 9);

                    const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; OpenStreetMap &copy; CARTO',
                        subdomains: 'abcd',
                        maxZoom: 19,
                    });

                    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                        maxZoom: 19,
                    });

                    cartoLight.addTo(map);

                    const baseMaps = {
                        "Carto Light": cartoLight,
                        "Citra Satelit": esriSatellite,
                    };

                    const overlayMaps: Record<string, any> = {};

                    // Fetch RainViewer Data
                    try {
                        const rvResponse = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                        const rvData = await rvResponse.json();
                        
                        if (rvData && rvData.host && rvData.radar && rvData.radar.past && rvData.radar.past.length > 0) {
                            // Menggunakan 1 frame terakhir saja untuk mencegah Limit API (Error 429)
                            const latestFrame = rvData.radar.past[rvData.radar.past.length - 1];
                            
                            const radarLayer = L.tileLayer(`${rvData.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
                                opacity: 0.65,
                                attribution: 'Radar &copy; RainViewer',
                                zIndex: 10,
                                maxNativeZoom: 12,
                                maxZoom: 19,
                            });

                            overlayMaps["Radar Hujan (Live)"] = radarLayer;
                        }
                    } catch (e) {
                        console.warn("Gagal mengambil data RainViewer:", e);
                    }

                    L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

                    // Custom icons based on yield expectation
                    const greenIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    });

                    const orangeIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    });

                    // Add markers for projects
                    projects.forEach((project, idx) => {
                        const coords = getDummyCoordinates(idx);
                        // Mocking status logic: even is green (good), odd is orange (warning)
                        const isGood = idx % 2 === 0;
                        const icon = isGood ? greenIcon : orangeIcon;
                        const statusText = isGood ? 'Optimal' : 'Perlu Perhatian';

                        const popupHtml = `
                            <div style="font-family: sans-serif; min-width: 150px;">
                                <h4 style="margin:0 0 5px 0; font-weight: bold; color: #2f6b3f;">${project.nama_tanaman}</h4>
                                <p style="margin:0 0 5px 0; font-size: 12px; color: #666;">${project.lokasi}</p>
                                <p style="margin:0; font-size: 12px; font-weight: bold; color: ${isGood ? '#4ade80' : '#f59e0b'};">${statusText}</p>
                            </div>
                        `;

                        L.marker(coords, { icon }).bindPopup(popupHtml).addTo(map);
                    });

                    mapRef.current = map;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Gagal memuat peta.';
                setMapError(message);
            } finally {
                if (isActive) setIsMapLoading(false);
            }
        };

        void initMap();

        return () => {
            isActive = false;
        };
    }, [projects]);

    return (
        <>
            <Head title="GIS Dashboard" />
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <PageHeader
                        title="Interactive GIS Dashboard"
                        description="Peta persebaran lahan pertanian dan status prediksi panen secara geografis."
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Peta Proyek Lahan</CardTitle>
                                <CardDescription>Visualisasi lokasi lahan Anda dengan indikator kesehatan panen.</CardDescription>
                            </div>
                            <Layers className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative w-full" style={{ height: '500px' }}>
                                {isMapLoading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-2 text-primary">
                                            <LoaderCircle className="h-8 w-8 animate-spin" />
                                            <span className="text-sm font-medium">Memuat GIS Map...</span>
                                        </div>
                                    </div>
                                )}
                                {mapError && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-destructive/10">
                                        <p className="text-destructive font-medium">{mapError}</p>
                                    </div>
                                )}
                                <div ref={mapContainerRef} className="h-full w-full z-0" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}

GISDashboard.layout = {
    breadcrumbs: [
        { title: 'GIS Dashboard', href: '/gis' },
    ],
};
