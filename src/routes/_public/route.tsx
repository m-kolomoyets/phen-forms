import type { AuthenticatedState, UnauthenticatedState } from '@/services/auth/types';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getSession } from '@/services/auth/api';
import { meQueryOptions } from '@/services/auth/queries';

export const Route = createFileRoute('/_public')({
    async beforeLoad({ context: { queryClient } }) {
        const session = await getSession();

        if (!session) {
            return {
                auth: {
                    user: null,
                    isAuthenticated: false,
                } satisfies UnauthenticatedState,
            };
        }

        try {
            const user = await queryClient.ensureQueryData(meQueryOptions());
            return {
                auth: { user, isAuthenticated: true } satisfies AuthenticatedState,
            };
        } catch {
            return {
                auth: { user: null, isAuthenticated: false } satisfies UnauthenticatedState,
            };
        }
    },
    component: Outlet,
});
