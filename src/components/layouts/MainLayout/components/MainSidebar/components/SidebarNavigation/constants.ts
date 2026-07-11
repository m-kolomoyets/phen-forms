import type { LinkProps } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { ClipboardListIcon, LayoutDashboardIcon } from 'lucide-react';

type SidebarNavigationLinkItem = {
    label: string;
    Icon: LucideIcon;
    linkProps: LinkProps;
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
        label: 'Questionnaires',
        Icon: ClipboardListIcon,
        linkProps: {
            to: '/questionnaires',
        },
    },
];
