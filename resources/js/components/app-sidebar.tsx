import { Link } from '@inertiajs/react';
import {
    BarChart3,
    CloudSun,
    History,
    Leaf,
    Settings,
    Sparkles,
    Sprout,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import SidebarNav from '@/components/sidebar-nav';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Sprout,
    },
    {
        title: 'Proyek Lahan',
        href: '/projects',
        icon: Leaf,
    },
    {
        title: 'Input Data',
        href: '/inputs/create',
        icon: CloudSun,
    },
    {
        title: 'Hasil Prediksi',
        href: '/histories',
        icon: BarChart3,
    },
    {
        title: 'Riwayat',
        href: '/histories',
        icon: History,
    },
    {
        title: 'Pengaturan',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Rekomendasi',
        href: '/histories',
        icon: Sparkles,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/80">
            <SidebarHeader className="pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-2xl">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
