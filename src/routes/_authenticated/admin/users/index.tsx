import { createFileRoute } from '@tanstack/react-router';
import { adminUsersQueryOptions } from '@/services/admin/queries';
import { AdminUsers } from '@/modules/Admin';

export const Route = createFileRoute('/_authenticated/admin/users/')({
    async loader({ context: { queryClient } }) {
        await queryClient.ensureQueryData(adminUsersQueryOptions());
    },
    component: AdminUsers,
});
