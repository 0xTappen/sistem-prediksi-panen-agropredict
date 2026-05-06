import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon: Icon,
}: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
}) {
    return (
        <Card className="rounded-2xl border border-dashed border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {Icon ? (
                    <div className="mb-4 rounded-2xl bg-muted p-3 text-primary">
                        <Icon className="h-6 w-6" />
                    </div>
                ) : null}
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {description}
                </p>
                {actionLabel && onAction ? (
                    <Button className="mt-5" onClick={onAction}>
                        {actionLabel}
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
