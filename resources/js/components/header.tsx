import { usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const { auth } = usePage().props;

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-card/85 px-4 backdrop-blur">
            <SidebarTrigger className="text-foreground" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="ml-auto text-sm text-muted-foreground">
                Halo, <span className="font-medium text-foreground">{auth.user?.name}</span>
            </div>
        </header>
    );
}
