import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground shadow-sm">
                <AppLogoIcon className="size-8 rounded-lg" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/80">
                    Harvest Dashboard
                </span>
            </div>
        </>
    );
}
