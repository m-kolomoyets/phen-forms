import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import '@/styles/index.css';
import { ErrorBoundary } from 'react-error-boundary';
import { GlobalError } from '@/components/GlobalError';

const prepareMSW = async () => {
    if (import.meta.env.VITE_USE_MSW === 'true') {
        const { worker } = await import('./mocks/browser');
        return worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: '/mockServiceWorker.js',
            },
        });
    }

    return Promise.resolve();
};

prepareMSW().then(() => {
    createRoot(document.getElementById('root') as HTMLElement).render(
        <StrictMode>
            <ErrorBoundary FallbackComponent={GlobalError}>
                <App />
            </ErrorBoundary>
        </StrictMode>
    );
});
