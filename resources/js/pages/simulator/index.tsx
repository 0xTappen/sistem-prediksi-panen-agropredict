import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FlaskConical, Droplets, CloudSun, Sprout } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function Simulator() {
    const [n, setN] = useState(50);
    const [p, setP] = useState(50);
    const [k, setK] = useState(50);
    const [ph, setPh] = useState(6.5);
    const [water, setWater] = useState(100);
    const [temp, setTemp] = useState(27);

    // Simple baseline prediction logic for demo purposes
    const baseYield = 2.5; // tons/ha
    const nFactor = n > 40 && n < 80 ? 1.2 : 0.8;
    const pFactor = p > 30 ? 1.1 : 0.9;
    const kFactor = k > 40 ? 1.1 : 0.9;
    const phFactor = Math.abs(ph - 6.5) < 1 ? 1.3 : 0.7;
    const waterFactor = water > 80 && water < 150 ? 1.2 : 0.6;
    const tempFactor = temp > 24 && temp < 32 ? 1.1 : 0.8;

    const estimatedYield = (baseYield * nFactor * pFactor * kFactor * phFactor * waterFactor * tempFactor).toFixed(2);

    return (
        <>
            <Head title="What-If Simulator" />
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <PageHeader
                        title="Simulasi 'What-If' Panen"
                        description="Geser slider untuk melihat bagaimana perubahan variabel lingkungan memengaruhi estimasi hasil panen secara real-time."
                    />
                </motion.div>

                <div className="grid gap-6 md:grid-cols-3">
                    <motion.div className="md:col-span-2 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="rounded-2xl border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Variabel Lingkungan & Tanah</CardTitle>
                                <CardDescription>Sesuaikan parameter untuk mensimulasikan kondisi lahan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Nitrogen (N): {n}</span></Label>
                                    <input type="range" min="0" max="140" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Phosphorus (P): {p}</span></Label>
                                    <input type="range" min="0" max="140" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Potassium (K): {k}</span></Label>
                                    <input type="range" min="0" max="140" value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><Sprout className="h-4 w-4" /> pH Tanah: {ph}</span></Label>
                                    <input type="range" min="3" max="10" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Jumlah Air (mm): {water}</span></Label>
                                    <input type="range" min="0" max="300" value={water} onChange={(e) => setWater(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex justify-between items-center text-primary"><span className="flex items-center gap-2"><CloudSun className="h-4 w-4" /> Suhu (°C): {temp}</span></Label>
                                    <input type="range" min="15" max="45" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="rounded-2xl border-border bg-card shadow-sm sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" /> Hasil Simulasi</CardTitle>
                                <CardDescription>Prediksi panen berdasarkan input di samping.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                                <motion.div 
                                    key={estimatedYield}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl font-bold text-primary"
                                >
                                    {estimatedYield}
                                </motion.div>
                                <p className="text-xl text-muted-foreground">ton / ha</p>
                                <div className="mt-6 w-full rounded-xl bg-muted/50 p-4 text-center text-sm">
                                    Nilai ini adalah simulasi kalkulasi lokal dan tidak disimpan ke database.
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

Simulator.layout = {
    breadcrumbs: [
        { title: 'Simulasi What-If', href: '/simulator' },
    ],
};
