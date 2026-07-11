import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuSkeleton } from '@/components/Sidebar';

function SidebarNavigationFallback() {
    return (
        <SidebarGroup>
            <SidebarMenu>
                {Array.from({ length: 7 }).map((_, index) => {
                    return (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuSkeleton showIcon={true} />
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export { SidebarNavigationFallback };
