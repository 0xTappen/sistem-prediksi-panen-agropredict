import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Leaf, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Sistem Prediksi Panen" />
            <div className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-10">
                <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
                    <div className="flex flex-col justify-between bg-gradient-to-br from-secondary/30 via-muted to-background p-8 md:p-10">
                        <div>
                            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground">
                                <Sprout className="h-4 w-4 text-primary" />
                                Smart Agriculture Dashboard
                            </div>
                            <h1 className="mt-6 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                                Sistem Prediksi Panen & Rekomendasi
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                                Kelola proyek lahan, analisis input pertanian,
                                prediksi hasil panen, dan rekomendasi perawatan
                                dalam satu aplikasi modern.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <Card className="rounded-2xl border border-border bg-white/90 py-0">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-foreground">
                                        Prediksi Cepat
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Proses input data hingga estimasi panen
                                        dalam alur singkat.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border border-border bg-white/90 py-0">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-foreground">
                                        Riwayat & PDF
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Arsip prediksi rapi dan siap diexport
                                        menjadi laporan PDF.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex items-center justify-center p-8 md:p-10">
                        <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
                                    <Leaf className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Selamat Datang
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        Harvest Dashboard
                                    </p>
                                </div>
                            </div>

                            {auth.user ? (
                                <Button asChild className="w-full justify-between">
                                    <Link href={dashboard()}>
                                        Buka Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Button asChild className="w-full justify-between">
                                        <Link href={login()}>
                                            Masuk
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    {canRegister ? (
                                        <Button asChild variant="outline" className="w-full justify-between">
                                            <Link href={register()}>
                                                Daftar
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
