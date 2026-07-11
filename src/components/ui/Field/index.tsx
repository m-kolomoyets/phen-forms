import type {
    FieldContentProps,
    FieldDescriptionProps,
    FieldErrorProps,
    FieldGroupProps,
    FieldLabelProps,
    FieldLegendProps,
    FieldProps,
    FieldSeparatorProps,
    FieldSetProps,
    FieldTitleProps,
} from './types';
import { cn } from '@/lib/utils/cn';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { fieldVariants } from './utils/variants';

function FieldSet({ className, ...props }: FieldSetProps) {
    return (
        <fieldset
            data-slot="field-set"
            className={cn(
                'gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3 flex flex-col',
                className
            )}
            {...props}
        />
    );
}

function FieldLegend({ className, variant = 'legend', ...props }: FieldLegendProps) {
    return (
        <legend
            data-slot="field-legend"
            data-variant={variant}
            className={cn('mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base', className)}
            {...props}
        />
    );
}

function FieldGroup({ className, ...props }: FieldGroupProps) {
    return (
        <div
            data-slot="field-group"
            className={cn(
                'gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4 group/field-group @container/field-group flex w-full flex-col',
                className
            )}
            {...props}
        />
    );
}

function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
    return (
        <div
            role="group"
            data-slot="field"
            data-orientation={orientation}
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    );
}

function FieldContent({ className, ...props }: FieldContentProps) {
    return (
        <div
            data-slot="field-content"
            className={cn('gap-0.5 group/field-content flex flex-1 flex-col leading-snug', className)}
            {...props}
        />
    );
}

function FieldLabel({ className, htmlFor, ...props }: FieldLabelProps) {
    return (
        <Label
            data-slot="field-label"
            className={cn(
                'has-data-checked:bg-primary/5 has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 gap-2 group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 group/field-label peer/field-label flex w-fit leading-snug',
                'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
                className
            )}
            htmlFor={htmlFor}
            {...props}
        />
    );
}

function FieldTitle({ className, ...props }: FieldTitleProps) {
    return (
        <div
            data-slot="field-label"
            className={cn(
                'gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50 flex w-fit items-center leading-snug',
                className
            )}
            {...props}
        />
    );
}

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
    return (
        <p
            data-slot="field-description"
            className={cn(
                'text-muted-foreground text-left text-sm [[data-variant=legend]+&]:-mt-1.5 leading-normal font-normal group-has-data-horizontal/field:text-balance',
                'last:mt-0 nth-last-2:-mt-1',
                '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
                className
            )}
            {...props}
        />
    );
}

function FieldSeparator({ children, className, ...props }: FieldSeparatorProps) {
    return (
        <div
            data-slot="field-separator"
            data-content={!!children}
            className={cn('-my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2 relative', className)}
            {...props}
        >
            <Separator className="absolute inset-0 top-1/2" />
            {children ? (
                <span
                    className="text-muted-foreground px-2 relative mx-auto block w-fit bg-background"
                    data-slot="field-separator-content"
                >
                    {children}
                </span>
            ) : null}
        </div>
    );
}

function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
    let content: React.ReactNode = null;

    if (children) {
        content = children;
    } else if (!errors) {
        content = null;
    } else if (errors?.length === 1 && errors[0]?.message) {
        content = errors[0].message;
    } else {
        content = (
            <ul className="ml-4 flex list-disc flex-col gap-1">
                {errors.map((error, index) => {
                    return error?.message ? <li key={index}>{error.message}</li> : null;
                })}
            </ul>
        );
    }

    if (!content) {
        return null;
    }

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn('text-destructive text-sm font-normal', className)}
            {...props}
        >
            {content}
        </div>
    );
}

export {
    Field,
    fieldVariants,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldContent,
    FieldTitle,
};
