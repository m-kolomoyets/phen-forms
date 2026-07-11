import type { TextareaProps } from './types';
import { cn } from '@/lib/utils/cn';

function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 field-sizing-content min-h-16 rounded-lg border bg-transparent px-2.5 py-1.5 text-base motion-safe:transition-colors aria-invalid:ring-3 md:text-sm w-full min-w-0 outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
