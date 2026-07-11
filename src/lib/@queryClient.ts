import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { COMMON_ERROR_MESSAGE } from '@/lib/constants';

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: Error;
    }
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            throwOnError: true,
        },
        mutations: {
            retry: false,
        },
    },
    queryCache: new QueryCache({
        onError(error, query) {
            const hasQueryData = query.state.data !== undefined;
            if (hasQueryData && error instanceof Error) {
                toast.error(error?.message || COMMON_ERROR_MESSAGE);
            }
        },
    }),
});
