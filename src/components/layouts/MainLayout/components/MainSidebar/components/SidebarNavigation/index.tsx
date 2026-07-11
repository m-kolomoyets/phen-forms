import { SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/Sidebar';
import { useSidebarContext } from '@/components/Sidebar/context/SidebarContext';
import { SIDEBAR_NAVIGATION_LINK_LIST } from './constants';
import { SidebarNavigationLink } from './components/SidebarNavigationLink';

function SidebarNavigation() {
    const { setOpenMobile } = useSidebarContext();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {SIDEBAR_NAVIGATION_LINK_LIST.map((item) => {
                    return (
                        <SidebarMenuItem
                            key={item.label}
                            onClick={() => {
                                setOpenMobile(false);
                            }}
                        >
                            <SidebarNavigationLink tooltipText={item.label} {...item.linkProps}>
                                <item.Icon className="size-4" />
                                {item.label}
                            </SidebarNavigationLink>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export { SidebarNavigation };
