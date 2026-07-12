import { Link, Outlet } from '@tanstack/react-router';
import { ClipboardListIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Sub-navigation for the hidden admin area. Deliberately not wired into the main
// sidebar — the admin flow is reachable only by URL and must stay non-obvious.
const ADMIN_NAV_LINKS = [
    { to: '/admin/questionnaires', label: 'Questionnaires', Icon: ClipboardListIcon },
    { to: '/admin/users', label: 'Users', Icon: UsersIcon },
] as const;

function AdminLayout() {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            <header className="flex items-center gap-3 border-b pb-4">
                <ShieldCheckIcon className="size-5 text-muted-foreground" />
                <h1 className="text-lg font-semibold">Admin</h1>
                <nav className="ml-auto flex items-center gap-1">
                    {ADMIN_NAV_LINKS.map(({ to, label, Icon }) => {
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                                )}
                                activeProps={{ className: 'bg-accent text-accent-foreground' }}
                            >
                                <Icon className="size-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </header>
            <Outlet />
        </div>
    );
}

export { AdminLayout };
