import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    if (variant === 'sidebar') {
        const { className, ...rest } = props;

        return (
            <SidebarInset
                className={cn('md:ml-0', className)}
                {...rest}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-5 rounded-2xl p-4 md:p-6"
            {...props}
        >
            {children}
        </main>
    );
}
