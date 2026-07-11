import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import '@/styles/index.css';
import { ErrorBoundary } from 'react-error-boundary';
import { GlobalError } from '@/components/GlobalError';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <ErrorBoundary FallbackComponent={GlobalError}>
            <App />
        </ErrorBoundary>
    </StrictMode>
);
