import { createFileRoute, redirect } from '@tanstack/react-router';
import { amIAdminQueryOptions } from '@/services/admin/queries';
import { AdminLayout } from '@/modules/Admin';

export const Route = createFileRoute('/_authenticated/admin')({
    // Single guard for the whole admin subtree. A non-admin (or any RPC failure)
    // is silently redirected to the questionnaires list — indistinguishable from
    // a route that does not exist. RLS is the real boundary; this only hides the
    // shell. No 403, no error UI: the flow never confirms itself to a probe.
    async beforeLoad({ context: { queryClient } }) {
        let isAdmin = false;

        try {
            isAdmin = await queryClient.ensureQueryData(amIAdminQueryOptions());
        } catch {
            isAdmin = false;
        }

        if (!isAdmin) {
            throw redirect({ to: '/questionnaires' });
        }
    },
    component: AdminLayout,
});
