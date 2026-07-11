import type { ToastProps } from './types';
import { Toaster as Sonner } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/context/ThemeContext';

function Toast({ className, style, ...props }: ToastProps) {
    const { theme } = useTheme();

    return (
        <Sonner
            {...props}
            theme={theme}
            className={cn('group/toast', className)}
            style={
                {
                    ...style,
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
        />
    );
}

export { Toast };
