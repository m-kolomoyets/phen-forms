import type {
    AlertDialogActionProps,
    AlertDialogCancelProps,
    AlertDialogContentProps,
    AlertDialogDescriptionProps,
    AlertDialogFooterProps,
    AlertDialogHeaderProps,
    AlertDialogOverlayProps,
    AlertDialogPortalProps,
    AlertDialogProps,
    AlertDialogTitleProps,
    AlertDialogTriggerProps,
} from './types';
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

function AlertDialog({ ...props }: AlertDialogProps) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogTriggerProps) {
    return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: AlertDialogPortalProps) {
    return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
    return (
        <AlertDialogPrimitive.Backdrop
            data-slot="alert-dialog-overlay"
            className={cn(
                'motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50 bg-black/10 motion-safe:duration-100',
                className
            )}
            {...props}
        />
    );
}

function AlertDialogContent({ className, size = 'default', ...props }: AlertDialogContentProps) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogPrimitive.Popup
                data-slot="alert-dialog-content"
                data-size={size}
                className={cn(
                    'motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-open:zoom-in-95 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 motion-safe:data-closed:zoom-out-95 group/alert-dialog-content ring-foreground/10 bg-popover text-popover-foreground fixed left-1/2 top-1/2 z-50 grid w-full max-w-xs -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 outline-none ring-1 data-[size=default]:sm:max-w-sm motion-safe:duration-100',
                    className
                )}
                {...props}
            />
        </AlertDialogPortal>
    );
}

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
    return (
        <div
            data-slot="alert-dialog-header"
            className={cn(
                'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left',
                className
            )}
            {...props}
        />
    );
}

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
    return (
        <div
            data-slot="alert-dialog-footer"
            className={cn(
                'bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
                className
            )}
            {...props}
        />
    );
}

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className={cn('text-base font-medium', className)}
            {...props}
        />
    );
}

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            className={cn('text-muted-foreground text-sm text-balance', className)}
            {...props}
        />
    );
}

function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
    return <Button data-slot="alert-dialog-action" className={cn(className)} {...props} />;
}

function AlertDialogCancel({ className, variant = 'outline', size = 'default', ...props }: AlertDialogCancelProps) {
    return (
        <AlertDialogPrimitive.Close
            data-slot="alert-dialog-cancel"
            className={cn(className)}
            render={<Button variant={variant} size={size} />}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
};
