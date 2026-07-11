import type { SidebarUserCardProps } from './types';
import { getRouteApi } from '@tanstack/react-router';
import { cn } from '@/lib/utils/cn';
import { SidebarAvatar } from './components/SidebarAvatar';

const routeApi = getRouteApi('/_authenticated');

function SidebarUserCard({ className }: SidebarUserCardProps) {
    const user = routeApi.useRouteContext({
        select(context) {
            return context.auth.user;
        },
    });
    const metadata = user.user_metadata;
    const email = user.email ?? '';
    const fullName = String(metadata.full_name ?? metadata.name ?? email);
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined;

    return (
        <div className={cn('flex items-center gap-2 py-1.5 text-left text-sm', className)}>
            <SidebarAvatar name={fullName} avatarUrl={avatarUrl} />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs mb-1">{email}</span>
            </div>
        </div>
    );
}

export { SidebarUserCard };
