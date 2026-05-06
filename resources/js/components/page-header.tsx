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
        <div className="app-surface flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
            <div className="min-w-0">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-1.5 max-w-3xl break-words text-sm leading-6 text-muted-foreground sm:text-base">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">{action}</div> : null}
        </div>
    );
}
