import type { AdminUserListItem } from '@/services/admin/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ShieldCheckIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatDateTime';
import { getNameInitials } from '@/lib/utils/getNameInitials';
import { adminUsersQueryOptions } from '@/services/admin/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

// Read-only. No mutations by design — admin granting stays direct-SQL-only, so
// there is deliberately no action surface here.
function AdminUsers() {
    const { data: users } = useSuspenseQuery(adminUsersQueryOptions());

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-2 font-medium">User</th>
                            <th className="px-4 py-2 font-medium">Email</th>
                            <th className="px-4 py-2 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            return <AdminUserRow key={user.id} user={user} />;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminUserRow({ user }: { user: AdminUserListItem }) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    const displayName = fullName || user.email;
    const initials = getNameInitials(fullName || user.email);

    return (
        <tr className="border-b last:border-b-0">
            <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                    <Avatar size="sm">
                        <AvatarImage src={user.avatar_url ?? undefined} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{displayName}</span>
                </div>
            </td>
            <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{user.email}</span>
                    {user.isAdmin && (
                        <Badge variant="secondary">
                            <ShieldCheckIcon />
                            Admin
                        </Badge>
                    )}
                </div>
            </td>
            <td className="px-4 py-2 text-muted-foreground">{formatDateTime(user.created_at)}</td>
        </tr>
    );
}

export { AdminUsers };
