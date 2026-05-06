import { Link } from '@inertiajs/react';
import { Leaf, Sprout } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-background px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
                <div className="relative hidden overflow-hidden border-r border-border bg-gradient-to-br from-secondary/30 via-muted to-background p-10 lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <Link href={home()} className="inline-flex items-center gap-3 text-foreground">
                            <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
                                <Sprout className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Smart Agriculture
                                </p>
                                <p className="text-lg font-semibold">
                                    Sistem Prediksi Panen
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-sm text-muted-foreground">
                            <Leaf className="h-4 w-4 text-primary" />
                            Harvest Dashboard Modern
                        </div>
                        <h2 className="max-w-md text-3xl font-semibold leading-tight text-foreground">
                            Kelola lahan, prediksi panen, dan rekomendasi perawatan dalam satu dashboard.
                        </h2>
                        <p className="max-w-md text-sm leading-6 text-muted-foreground">
                            Platform ini membantu proses pengambilan keputusan pertanian berbasis data input lahan, cuaca, dan analisis prediksi.
                        </p>
                    </div>

                    <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
                    <div className="pointer-events-none absolute -left-16 top-1/4 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
                </div>

                <div className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md space-y-7">
                        <div className="flex flex-col gap-4 text-center lg:text-left">
                            <Link href={home()} className="inline-flex items-center justify-center gap-2 lg:hidden">
                                <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
                                    <Sprout className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-foreground">Sistem Prediksi Panen</span>
                            </Link>

                            <div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {title}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
