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
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div
                    className={cn(
                        'reveal-up mx-auto w-full px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-6',
                        isChatbotPage
                            ? 'max-w-none px-0 pb-0 pt-0 md:px-0 md:pb-0 md:pt-0 xl:px-0'
                            : 'max-w-screen-2xl xl:px-8',
                    )}
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
