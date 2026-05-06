import { usePage } from '@inertiajs/react';
import { Sprout } from 'lucide-react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground">
                <Sprout className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
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
