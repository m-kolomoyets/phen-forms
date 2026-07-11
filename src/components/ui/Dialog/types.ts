import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

export type DialogProps = DialogPrimitive.Root.Props;

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

export type DialogCloseProps = DialogPrimitive.Close.Props;

export type DialogPortalProps = DialogPrimitive.Portal.Props;

export type DialogOverlayProps = DialogPrimitive.Backdrop.Props;

export type DialogContentProps = DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
};

export type DialogHeaderProps = React.ComponentProps<'div'>;

export type DialogFooterProps = React.ComponentProps<'div'> & {
    showCloseButton?: boolean;
};

export type DialogTitleProps = DialogPrimitive.Title.Props;

export type DialogDescriptionProps = DialogPrimitive.Description.Props;
