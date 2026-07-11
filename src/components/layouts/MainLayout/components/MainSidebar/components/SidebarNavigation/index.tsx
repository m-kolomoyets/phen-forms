import { getRouteApi } from '@tanstack/react-router';
import { hasPermissions } from '@/lib/utils/auth/permissions';
import { SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/Sidebar';
import { useSidebarContext } from '@/components/Sidebar/context/SidebarContext';
import { SIDEBAR_NAVIGATION_LINK_LIST } from './constants';
import { SidebarNavigationLink } from './components/SidebarNavigationLink';

const routeApi = getRouteApi('/_authenticated');

function SidebarNavigation() {
    const { setOpenMobile } = useSidebarContext();
    const role = routeApi.useRouteContext({
        select(context) {
            return context.auth.me.role;
        },
    });

    return (
        <SidebarGroup>
            <SidebarMenu>
                {SIDEBAR_NAVIGATION_LINK_LIST.map((item) => {
                    if (item?.rolePermissionKey && !hasPermissions(item.rolePermissionKey, role)) {
                        return null;
                    }

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
