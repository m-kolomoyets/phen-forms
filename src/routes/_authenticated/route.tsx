import type { AuthenticatedState } from '@/services/authExample/types';
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router';
import { getAuthToken, removeAuthToken, removeRefreshToken } from '@/lib/utils/auth/tokens';
import { meQueryOptions } from '@/services/authExample/queries';
import { MainLayout } from '@/components/layouts/MainLayout';

export const Route = createFileRoute('/_authenticated')({
    async beforeLoad({ context: { queryClient }, location }) {
        const unauthRedirectOptions = {
            to: '/login',
            search: { redirect: location.href },
            replace: true,
        } as const;

        if (!getAuthToken()) {
            throw redirect(unauthRedirectOptions);
        }

        try {
            const me = await queryClient.ensureQueryData(meQueryOptions());

            return { auth: { isAuthenticated: true, me } satisfies AuthenticatedState };
        } catch (error) {
            if (isRedirect(error)) {
                throw error;
            }

            removeAuthToken();
            removeRefreshToken();
            throw redirect(unauthRedirectOptions);
        }
    },
    component: MainLayout,
});
