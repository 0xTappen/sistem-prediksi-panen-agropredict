import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Bot,
    CloudSun,
    History,
    Leaf,
    MapPin,
    Settings,
    Sparkles,
    Sprout,
    SlidersHorizontal,
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
        title: 'Chatbot AI',
        href: '/chatbot',
        icon: Bot,
    },
    {
        title: 'Hasil Prediksi',
        href: '/histories?menu=hasil',
        icon: BarChart3,
    },
    {
        title: 'GIS Map',
        href: '/gis',
        icon: MapPin,
    },
    {
        title: 'Simulasi',
        href: '/simulator',
        icon: SlidersHorizontal,
    },
    {
        title: 'Riwayat',
        href: '/histories?menu=riwayat',
        icon: History,
    },
    {
        title: 'Pengaturan',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Rekomendasi',
        href: '/histories?menu=rekomendasi',
        icon: Sparkles,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarHeader className="pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-2xl px-3">
                            <Link href={dashboard()} prefetch className="min-w-0">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1 pb-2">
                <SidebarNav items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pt-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
