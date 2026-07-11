import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/services/auth/types';
import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { queryClient } from '@/lib/@queryClient';
import { ErrorComponent } from '@/components/ErrorComponent';
import { NotFound } from '@/components/NotFound';
import { Loader } from '@/components/ui/Loader';

type RouterContext = { queryClient: QueryClient; auth: AuthContext };

const router = createRouter({
    routeTree,
    context: {
        queryClient,
        auth: { isAuthenticated: false, user: null },
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultPendingMs: 100,
    defaultPendingMinMs: 500,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorComponent,
    defaultPendingComponent() {
        return <Loader className="size-16 m-auto" />;
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export { router, type RouterContext };
