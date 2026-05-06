import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({
    title,
    value,
    hint,
    icon: Icon,
}: {
    title: string;
    value: string;
    hint?: string;
    icon: LucideIcon;
}) {
    return (
        <Card className="soft-hover overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
            <CardContent className="flex items-start justify-between p-5 md:p-6">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-primary md:text-[2rem]">
                        {value}
                    </p>
                    {hint ? (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {hint}
                        </p>
                    ) : null}
                </div>
                <div className="rounded-2xl border border-border/70 bg-secondary/25 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}
