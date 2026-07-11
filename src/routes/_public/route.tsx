import type { AuthenticatedState, UnauthenticatedState } from '@/services/authExample/types';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getAuthToken } from '@/lib/utils/auth/tokens';
import { meQueryOptions } from '@/services/authExample/queries';

export const Route = createFileRoute('/_public')({
    async beforeLoad({ context: { queryClient } }) {
        if (!getAuthToken()) {
            return {
                auth: {
                    me: null,
                    isAuthenticated: false,
                } satisfies UnauthenticatedState,
            };
        }

        try {
            const me = await queryClient.ensureQueryData(meQueryOptions());
            return {
                auth: { me, isAuthenticated: true } satisfies AuthenticatedState,
            };
        } catch {
            return {
                auth: { me: null, isAuthenticated: false } satisfies UnauthenticatedState,
            };
        }
    },
    component: Outlet,
});
