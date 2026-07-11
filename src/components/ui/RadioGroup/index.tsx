import type { RadioGroupItemProps, RadioGroupProps } from './types';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cn } from '@/lib/utils/cn';

function RadioGroup({ className, ...props }: RadioGroupProps) {
    return <RadioGroupPrimitive data-slot="radio-group" className={cn('grid gap-2', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
    return (
        <Radio.Root
            data-slot="radio-group-item"
            className={cn(
                'flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input text-primary shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
                className
            )}
            {...props}
        >
            <Radio.Indicator
                data-slot="radio-group-indicator"
                className="flex items-center justify-center after:size-2 after:rounded-full after:bg-primary after:content-['']"
            />
        </Radio.Root>
    );
}

export { RadioGroup, RadioGroupItem };
