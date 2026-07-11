import type { RouterContext } from '@/lib/@router';
import { lazy, Suspense } from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { noopReturnNull } from '@/lib/utils/noopReturnNull';
import { Toast } from '@/components/ui/Toast';
import { TooltipProvider } from '@/components/ui/Tooltip';

const TanStackRouterDevtools = import.meta.env.DEV
    ? lazy(async () => {
          const res = await import('@tanstack/react-router-devtools');
          return {
              default: res.TanStackRouterDevtools,
          };
      })
    : noopReturnNull;

const TanStackQueryDevtools = import.meta.env.DEV
    ? lazy(async () => {
          const res = await import('@tanstack/react-query-devtools');
          return {
              default: res.ReactQueryDevtools,
          };
      })
    : noopReturnNull;

export const Route = createRootRouteWithContext<RouterContext>()({
    component() {
        return (
            <>
                <TooltipProvider>
                    <Outlet />
                    <Toast richColors={true} closeButton={true} swipeDirections={['bottom']} />
                </TooltipProvider>
                <Suspense>
                    <TanStackRouterDevtools position="bottom-right" />
                    <TanStackQueryDevtools position="bottom" />
                </Suspense>
            </>
        );
    },
});
