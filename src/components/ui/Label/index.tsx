import type { LabelProps } from './types';
import { cn } from '@/lib/utils/cn';

function Label({ className, htmlFor, ...props }: LabelProps) {
    return (
        <label
            className={cn(
                'gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
                className
            )}
            htmlFor={htmlFor}
            {...props}
        />
    );
}

export { Label };
