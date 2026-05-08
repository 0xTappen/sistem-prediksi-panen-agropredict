import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    CloudSun,
    FileText,
    HelpCircle,
    Laptop,
    Leaf,
    MapPinned,
    Menu,
    Moon,
    Sparkles,
    Sun,
    Target,
    TrendingUp,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

type WelcomeProps = {
    canRegister?: boolean;
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
};

type FaqItem = {
    question: string;
    answer: string;
};

const masalah = [
    'Sulit memperkirakan hasil panen secara konsisten.',
    'Data cuaca dan tanah tidak terdokumentasi dengan rapi.',
    'Pemupukan sering berdasarkan perkiraan, bukan data.',
    'Riwayat musim tanam sulit dibandingkan antar periode.',
    'Rekomendasi perawatan belum berbasis data lapangan.',
];

const fitur = [
    {
        icon: MapPinned,
        title: 'Manajemen Proyek Lahan',
        description: 'Tambah, edit, dan kelola data lahan pertanian.',
    },
    {
        icon: Leaf,
        title: 'Input Data Pertanian',
        description: 'Catat pupuk, tanah, air, dan cuaca dalam satu form.',
    },
    {
        icon: CloudSun,
        title: 'Integrasi Data BMKG',
        description: 'Ambil data suhu, kelembapan, dan curah hujan otomatis dari BMKG.',
    },
    {
        icon: BarChart3,
        title: 'Prediksi Hasil Panen',
        description: 'Hitung estimasi panen dalam ton berdasarkan data input.',
    },
    {
        icon: Sparkles,
        title: 'Rekomendasi Pintar',
        description: 'Saran pupuk, waktu tanam, panen, dan perawatan tanaman.',
    },
    {
        icon: FileText,
        title: 'Riwayat & Export PDF',
        description: 'Simpan hasil prediksi dan export laporan dalam PDF.',
    },
];

const steps = [
    'Buat akun atau login.',
    'Tambahkan proyek lahan.',
    'Input data pupuk, tanah, air, dan cuaca.',
    'Sistem memproses prediksi.',
    'Hasil panen dan rekomendasi ditampilkan.',
    'Simpan riwayat atau export PDF.',
];

const manfaat = [
    'Membantu prediksi panen lebih terukur.',
    'Mendukung keputusan pemupukan.',
    'Memantau kondisi lahan dari musim ke musim.',
    'Menyimpan arsip hasil prediksi secara rapi.',
    'Mempermudah pembuatan laporan PDF.',
    'Mengurangi keputusan berbasis tebakan.',
];

const faqItems: FaqItem[] = [
    {
        question: 'Apakah aplikasi ini gratis?',
        answer: 'Untuk tahap demo dan development, aplikasi dapat digunakan tanpa biaya lisensi tambahan.',
    },
    {
        question: 'Apakah bisa digunakan tanpa API BMKG?',
        answer: 'Bisa. Jika data BMKG gagal diambil, Anda tetap dapat mengisi data cuaca secara manual.',
    },
    {
        question: 'Apakah data disimpan?',
        answer: 'Ya, data pengguna dan riwayat prediksi disimpan di sistem sesuai akun masing-masing.',
    },
    {
        question: 'Apakah hasil prediksi bisa diexport PDF?',
        answer: 'Bisa. Fitur export PDF tersedia di halaman Riwayat prediksi.',
    },
    {
        question: 'Apakah bisa dipakai di HP?',
        answer: 'Bisa. Antarmuka dirancang responsif untuk desktop maupun perangkat mobile.',
    },
];

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { auth } = usePage<WelcomeProps>().props;
    const { appearance, updateAppearance } = useAppearance();
    const isLoggedIn = Boolean(auth?.user);

    const ctaPrimary = useMemo(() => {
        if (isLoggedIn) {
            return { label: 'Masuk Dashboard', href: dashboard().url };
        }

        return { label: 'Mulai Sekarang', href: register().url };
    }, [isLoggedIn]);

    return (
        <>
            <Head title="Sistem Prediksi Panen" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="rounded-xl bg-primary/15 p-2.5 ring-1 ring-primary/20">
                                <AppLogoIcon className="h-8 w-8 rounded-lg" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-none">Sistem Prediksi Panen</p>
                                <p className="text-xs text-muted-foreground">Smart Agriculture Dashboard</p>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-6 text-sm md:flex">
                            <a href="#fitur" className="text-muted-foreground transition-colors hover:text-foreground">Fitur</a>
                            <a href="#cara-kerja" className="text-muted-foreground transition-colors hover:text-foreground">Cara Kerja</a>
                            <a href="#manfaat" className="text-muted-foreground transition-colors hover:text-foreground">Manfaat</a>
                            <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
                        </nav>

                        <div className="hidden items-center gap-2 md:flex">
                            <ThemeToggle appearance={appearance} onChange={updateAppearance} />

                            {!isLoggedIn && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={login()}>Login</Link>
                                </Button>
                            )}

                            {isLoggedIn ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>Masuk Dashboard</Link>
                                </Button>
                            ) : (
                                canRegister && (
                                    <Button asChild size="sm">
                                        <Link href={register()}>Daftar</Link>
                                    </Button>
                                )
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileOpen((value) => !value)}
                        >
                            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>

                    {mobileOpen ? (
                        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
                            <div className="flex flex-col gap-3 text-sm">
                                <a href="#fitur" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Fitur</a>
                                <a href="#cara-kerja" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Cara Kerja</a>
                                <a href="#manfaat" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Manfaat</a>
                                <a href="#faq" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>FAQ</a>
                            </div>

                            <div className="mt-4 space-y-2">
                                <ThemeToggle appearance={appearance} onChange={updateAppearance} compact />

                                {isLoggedIn ? (
                                    <Button asChild className="w-full">
                                        <Link href={dashboard()} onClick={() => setMobileOpen(false)}>Masuk Dashboard</Link>
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={login()} onClick={() => setMobileOpen(false)}>Login</Link>
                                        </Button>
                                        {canRegister ? (
                                            <Button asChild className="w-full">
                                                <Link href={register()} onClick={() => setMobileOpen(false)}>Daftar</Link>
                                            </Button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </header>

                <main>
                    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-10 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-14">
                        <div>
                            <Badge className="bg-secondary text-secondary-foreground">Smart Agriculture</Badge>
                            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                                Prediksi Hasil Panen & Rekomendasi Pertanian Berbasis Data
                            </h1>
                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                Kelola proyek lahan, analisis kondisi tanah dan cuaca, prediksi estimasi panen,
                                lalu dapatkan rekomendasi pupuk, waktu tanam, dan perawatan tanaman secara praktis.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href={ctaPrimary.href}>
                                        {ctaPrimary.label}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>

                                {!isLoggedIn && (
                                    <Button asChild variant="outline">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                            <div className="relative border-b border-border bg-muted/40 p-3">
                                <img
                                    src="/images/agro-dashboard-hero.svg"
                                    alt="Ilustrasi dashboard prediksi panen"
                                    className="h-auto w-full rounded-2xl border border-border/70 bg-background object-cover"
                                    loading="lazy"
                                />
                                <div className="pointer-events-none absolute inset-x-0 bottom-3 mx-6 rounded-xl bg-card/85 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
                                    Visual ringkas: estimasi panen, skor kecocokan, dan rekomendasi.
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg">Preview Smart Dashboard</CardTitle>
                                <CardDescription>Contoh ringkasan data panen berbasis input lahan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Estimasi Panen</p>
                                        <p className="mt-1 text-2xl font-semibold text-primary">8.4 ton</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Skor Kecocokan</p>
                                        <p className="mt-1 text-2xl font-semibold text-info">86%</p>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status Cuaca</span>
                                        <Badge className="bg-secondary text-secondary-foreground">Stabil</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Rekomendasi Pupuk</span>
                                        <span className="font-medium">Kaya Nitrogen</span>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Progress Kecocokan</span>
                                            <span>86%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted">
                                            <div className="h-2 w-[86%] rounded-full bg-primary" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <Card className="rounded-3xl border border-border bg-card">
                            <CardHeader>
                                <CardTitle>Masalah yang Sering Dihadapi Petani</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {masalah.map((item) => (
                                    <div key={item} className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-sm text-foreground">{item}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <section id="fitur" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <div className="mb-5 flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-semibold">Fitur Utama Aplikasi</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {fitur.map((item) => (
                                <Card key={item.title} className="rounded-2xl border border-border bg-card">
                                    <CardHeader>
                                        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section id="cara-kerja" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <Card className="rounded-3xl border border-border bg-card">
                            <CardHeader>
                                <CardTitle>Cara Kerja Sistem</CardTitle>
                                <CardDescription>Alur sederhana dari input data hingga laporan prediksi.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {steps.map((step, index) => (
                                    <div key={step} className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs font-medium text-primary">Langkah {index + 1}</p>
                                        <p className="mt-2 text-sm">{step}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <section id="manfaat" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <div className="mb-5 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-semibold">Manfaat untuk Pengelolaan Pertanian</h2>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {manfaat.map((item) => (
                                <div key={item} className="rounded-2xl border border-border bg-card p-4">
                                    <div className="mb-2 inline-flex rounded-full bg-secondary/40 p-1.5 text-primary">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <Card className="rounded-3xl border border-border bg-card">
                            <CardHeader>
                                <CardTitle>Preview Dashboard</CardTitle>
                                <CardDescription>Data dummy statis untuk gambaran ringkasan sistem.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
                                <div className="order-2 grid gap-4 md:grid-cols-2 lg:order-1">
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Total Proyek</p>
                                        <p className="mt-1 text-2xl font-semibold text-primary">12</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Estimasi Panen</p>
                                        <p className="mt-1 text-2xl font-semibold text-primary">8.4 ton</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Skor Kecocokan</p>
                                        <p className="mt-1 text-2xl font-semibold text-info">86%</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-muted p-4">
                                        <p className="text-xs text-muted-foreground">Rekomendasi</p>
                                        <p className="mt-1 text-sm font-medium">Tambahkan pupuk kaya Nitrogen</p>
                                    </div>
                                </div>
                                <div className="order-1 rounded-2xl border border-border bg-muted/40 p-3 lg:order-2">
                                    <img
                                        src="/images/agro-dashboard-hero.svg"
                                        alt="Mockup dashboard prediksi panen"
                                        className="h-full min-h-[220px] w-full rounded-xl border border-border/60 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section id="faq" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
                        <div className="mb-5 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-semibold">FAQ</h2>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {faqItems.map((faq) => (
                                <Card key={faq.question} className="rounded-2xl border border-border bg-card">
                                    <CardHeader>
                                        <CardTitle className="text-base">{faq.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
                        <Card className={cn('rounded-3xl border border-border bg-gradient-to-r from-secondary/30 via-muted to-accent/20')}>
                            <CardContent className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
                                <div>
                                    <h3 className="text-2xl font-semibold">Siap Mengelola Panen dengan Lebih Cerdas?</h3>
                                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                        Mulai catat data lahan, prediksi hasil panen, dan dapatkan rekomendasi berbasis data.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {isLoggedIn ? (
                                        <Button asChild>
                                            <Link href={dashboard()}>Masuk Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            {canRegister && (
                                                <Button asChild>
                                                    <Link href={register()}>Daftar Sekarang</Link>
                                                </Button>
                                            )}
                                            <Button asChild variant="outline">
                                                <Link href={login()}>Login</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </main>

                <footer className="border-t border-border bg-muted/40">
                    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-2 md:px-8">
                        <div>
                            <p className="text-lg font-semibold">Sistem Prediksi Panen</p>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Aplikasi untuk pengelolaan data lahan, prediksi hasil panen, dan rekomendasi pertanian berbasis data.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="space-y-2">
                                <p className="font-medium">Navigasi</p>
                                <a href="#fitur" className="block text-muted-foreground hover:text-foreground">Fitur</a>
                                <a href="#cara-kerja" className="block text-muted-foreground hover:text-foreground">Cara Kerja</a>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">Akses</p>
                                <Link href={login()} className="block text-muted-foreground hover:text-foreground">Login</Link>
                                {canRegister && (
                                    <Link href={register()} className="block text-muted-foreground hover:text-foreground">Register</Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
                        © {new Date().getFullYear()} Sistem Prediksi Panen & Rekomendasi.
                    </div>
                </footer>
            </div>
        </>
    );
}

function ThemeToggle({
    appearance,
    onChange,
    compact = false,
}: {
    appearance: Appearance;
    onChange: (mode: Appearance) => void;
    compact?: boolean;
}) {
    const options: Array<{
        mode: Appearance;
        label: string;
        icon: typeof Sun;
    }> = [
        { mode: 'light', label: 'Light', icon: Sun },
        { mode: 'dark', label: 'Dark', icon: Moon },
        { mode: 'system', label: 'System', icon: Laptop },
    ];

    return (
        <div className={cn('inline-flex items-center rounded-2xl border border-border bg-muted/60 p-1', compact && 'w-full justify-between overflow-x-auto')}>
            {options.map((option) => (
                <Button
                    key={option.mode}
                    type="button"
                    size="sm"
                    variant={appearance === option.mode ? 'default' : 'ghost'}
                    className={cn('h-8 gap-1.5 rounded-xl px-2.5 text-xs', compact && 'min-w-[88px] flex-1')}
                    onClick={() => onChange(option.mode)}
                >
                    <option.icon className="h-3.5 w-3.5" />
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
