import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/lib/@queryClient';
import { router } from '@/lib/@router';
import { envSchema } from '@/lib/schemas';
import { checkEnv } from '@/lib/utils/checkEnv';
import { ThemeProvider } from '@/context/ThemeContext';
import { useRemoveInitialStyle } from '@/hooks/useRemoveInitialStyle';

function App() {
    useState(() => {
        checkEnv(envSchema);
    });
    useRemoveInitialStyle();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export { App };
