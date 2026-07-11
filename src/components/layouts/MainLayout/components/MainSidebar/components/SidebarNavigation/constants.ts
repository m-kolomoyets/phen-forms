import type { LinkProps } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import type { RolePermissionsKeys } from '@/lib/utils/auth/permissions';
import { LayoutDashboardIcon, ShoppingBagIcon, TicketsIcon } from 'lucide-react';

type SidebarNavigationLinkItem = {
    label: string;
    Icon: LucideIcon;
    linkProps: LinkProps;
    rolePermissionKey?: RolePermissionsKeys;
};

export const SIDEBAR_NAVIGATION_LINK_LIST: SidebarNavigationLinkItem[] = [
    {
        label: 'Dashboard',
        Icon: LayoutDashboardIcon,
        linkProps: {
            to: '/dashboard',
        },
    },
    {
        label: 'Merchants',
        Icon: ShoppingBagIcon,
        linkProps: {
            to: '/merchants',
        },
        rolePermissionKey: 'merchants.view',
    },
    {
        label: 'Vouchers',
        Icon: TicketsIcon,
        linkProps: {
            to: '/vouchers',
        },
        rolePermissionKey: 'vouchers.view',
    },
];
