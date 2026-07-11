import type { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import type { ButtonProps } from '@/components/ui/Button/types';

export type AlertDialogProps = AlertDialogPrimitive.Root.Props;

export type AlertDialogTriggerProps = AlertDialogPrimitive.Trigger.Props;

export type AlertDialogPortalProps = AlertDialogPrimitive.Portal.Props;

export type AlertDialogOverlayProps = AlertDialogPrimitive.Backdrop.Props;

export type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props & {
    size?: 'default' | 'sm';
};

export type AlertDialogHeaderProps = React.ComponentProps<'div'>;

export type AlertDialogFooterProps = React.ComponentProps<'div'>;

export type AlertDialogTitleProps = AlertDialogPrimitive.Title.Props;

export type AlertDialogDescriptionProps = AlertDialogPrimitive.Description.Props;

export type AlertDialogActionProps = ButtonProps;

export type AlertDialogCancelProps = AlertDialogPrimitive.Close.Props & Pick<ButtonProps, 'variant' | 'size'>;
