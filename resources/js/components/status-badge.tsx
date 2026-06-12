import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StatusBadge({
    status,
}: {
    status: 'tinggi' | 'sedang' | 'rendah' | string;
}) {
    const normalized = status.toLowerCase();

    if (normalized === 'tinggi') {
        return (
            <Badge className="bg-emerald-600 text-white dark:bg-zinc-200 dark:text-zinc-950">
                <CheckCircle2 className="h-3.5 w-3.5" /> Tinggi
            </Badge>
        );
    }

    if (normalized === 'sedang') {
        return (
            <Badge className="bg-amber-500 text-white dark:bg-zinc-500 dark:text-zinc-100">
                <AlertTriangle className="h-3.5 w-3.5" /> Sedang
            </Badge>
        );
    }

    if (normalized === 'rendah') {
        return (
            <Badge className="bg-red-600 text-white dark:bg-zinc-800 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-600/80">
                <XCircle className="h-3.5 w-3.5" /> Rendah
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            <Info className="h-3.5 w-3.5" /> {status}
        </Badge>
    );
}
