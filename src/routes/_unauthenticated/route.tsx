import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { FALLBACK_REDIRECT } from '@/lib/constants';
import { getSession } from '@/services/auth/api';

export const Route = createFileRoute('/_unauthenticated')({
    validateSearch: z.object({
        redirect: z.string().optional().catch(''),
    }),
    async beforeLoad({ search }) {
        const session = await getSession();

        if (session) {
            throw redirect({
                to: search.redirect || FALLBACK_REDIRECT,
                replace: true,
            });
        }
    },
    component: Outlet,
});
