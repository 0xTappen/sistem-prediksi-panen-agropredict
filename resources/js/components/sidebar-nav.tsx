import { Link, usePage } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export default function SidebarNav({ items }: { items: NavItem[] }) {
    const page = usePage();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const currentUrl = page.url;

    return (
        <SidebarGroup className="px-2">
            <SidebarGroupLabel className="px-3 text-sidebar-foreground/75">
                Navigasi
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item, index) => {
                    const hrefString = typeof item.href === 'string' ? item.href : item.href.url;
                    const isMenuScoped = hrefString.includes('menu=');
                    const isActive = isMenuScoped
                        ? currentUrl.includes(hrefString.split('?')[1] ?? '')
                        : isCurrentOrParentUrl(item.href);

                    return (
                    <SidebarMenuItem key={item.title} className="animate-in fade-in duration-300" style={{ animationDelay: `${index * 35}ms` }}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            size="lg"
                            className="rounded-2xl px-3 transition-all duration-200 hover:-translate-y-0.5"
                            tooltip={item.title}
                        >
                            <Link href={item.href} prefetch className="min-w-0">
                                {item.icon ? <item.icon className="h-4 w-4 shrink-0" /> : null}
                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )})}
            </SidebarMenu>
        </SidebarGroup>
    );
}
