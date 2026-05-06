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
                className={cn('min-w-0 flex-1 overflow-x-clip md:ml-0', className)}
                {...rest}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full min-w-0 max-w-7xl flex-1 flex-col gap-5 rounded-2xl p-4 sm:p-6 lg:p-8"
            {...props}
        >
            {children}
        </main>
    );
}
