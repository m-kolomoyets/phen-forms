import { createFileRoute } from '@tanstack/react-router';
import { checkIsRouteAllowed } from '@/lib/utils/auth/permissions';
import { usersQueryOptions } from '@/services/users/queries';
import { Merchants } from '@/modules/Merchants';

export const Route = createFileRoute('/_authenticated/merchants/')({
    beforeLoad({ context: { auth } }) {
        checkIsRouteAllowed('merchants.view', auth.me.role);
    },
    async loader({ context: { queryClient } }) {
        await queryClient.ensureQueryData(usersQueryOptions());
    },
    component: Merchants,
});
