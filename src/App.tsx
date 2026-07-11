import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/lib/@queryClient';
import { router } from '@/lib/@router';
import { supabase } from '@/lib/@supabase';
import { envSchema } from '@/lib/schemas';
import { checkEnv } from '@/lib/utils/checkEnv';
import { ThemeProvider } from '@/context/ThemeContext';
import { useRemoveInitialStyle } from '@/hooks/useRemoveInitialStyle';
import { authKeys } from '@/services/auth/queryKeys';

function App() {
    useState(() => {
        checkEnv(envSchema);
    });
    useRemoveInitialStyle();

    useEffect(function syncAuthState() {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(function handleAuthStateChange(event) {
            if (event === 'SIGNED_OUT') {
                queryClient.clear();
                router.invalidate();

                return;
            }

            queryClient.invalidateQueries({ queryKey: authKeys.meQueryKey() });
        });

        return function unsubscribe() {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export { App };
