import { usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const { auth } = usePage().props;
    const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    return (
        <header className="glass-header sticky top-0 z-20">
            <div className="mx-auto flex h-16 w-full min-w-0 max-w-screen-2xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:h-[72px] md:px-6 xl:px-8">
                <SidebarTrigger className="text-foreground" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {currentTitle}
                    </p>
                    <div className="hidden md:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
                <div className="ml-auto hidden min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-2.5 py-1.5 text-sm lg:flex">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    <span className="truncate text-muted-foreground">
                        Halo, <span className="font-medium text-foreground">{auth.user?.name}</span>
                    </span>
                </div>
            </div>
        </header>
    );
}
