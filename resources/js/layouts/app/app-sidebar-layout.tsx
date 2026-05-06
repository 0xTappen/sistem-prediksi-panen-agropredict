import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { cn } from '@/lib/utils';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const page = usePage();
    const isChatbotPage = page.component === 'chatbot/index';

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div
                    className={cn(
                        'reveal-up mx-auto w-full min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
                        isChatbotPage
                            ? 'max-w-none px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4'
                            : 'max-w-screen-2xl',
                    )}
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
