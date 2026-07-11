import type { AuthenticatedState } from '@/services/auth/types';
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router';
import { getSession } from '@/services/auth/api';
import { meQueryOptions } from '@/services/auth/queries';
import { MainLayout } from '@/components/layouts/MainLayout';

export const Route = createFileRoute('/_authenticated')({
    async beforeLoad({ context: { queryClient }, location }) {
        const unauthRedirectOptions = {
            to: '/login',
            search: { redirect: location.href },
            replace: true,
        } as const;

        const session = await getSession();

        if (!session) {
            throw redirect(unauthRedirectOptions);
        }

        try {
            const user = await queryClient.ensureQueryData(meQueryOptions());

            return { auth: { isAuthenticated: true, user } satisfies AuthenticatedState };
        } catch (error) {
            if (isRedirect(error)) {
                throw error;
            }

            throw redirect(unauthRedirectOptions);
        }
    },
    component: MainLayout,
});
