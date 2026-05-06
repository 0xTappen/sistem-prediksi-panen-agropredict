import type { ReactNode } from 'react';

export default function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="app-surface flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-6">
            <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground md:text-[1.9rem]">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground md:text-[0.95rem]">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
