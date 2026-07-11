import type {
    DropdownMenuCheckboxItemProps,
    DropdownMenuContentProps,
    DropdownMenuGroupProps,
    DropdownMenuItemProps,
    DropdownMenuLabelProps,
    DropdownMenuPortalProps,
    DropdownMenuProps,
    DropdownMenuRadioGroupProps,
    DropdownMenuRadioItemProps,
    DropdownMenuSeparatorProps,
    DropdownMenuShortcutProps,
    DropdownMenuSubContentProps,
    DropdownMenuSubProps,
    DropdownMenuSubTriggerProps,
    DropdownMenuTriggerProps,
} from './types';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function DropdownMenu(props: DropdownMenuProps) {
    return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal(props: DropdownMenuPortalProps) {
    return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
    return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
    className,
    align = 'start',
    alignOffset = 0,
    side = 'bottom',
    sideOffset = 4,
    ...props
}: DropdownMenuContentProps) {
    return (
        <DropdownMenuPortal>
            <MenuPrimitive.Positioner
                className="isolate z-50 outline-none"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <MenuPrimitive.Popup
                    data-slot="dropdown-menu-content"
                    className={cn(
                        'motion-safe:data-open:animate-in motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 motion-safe:data-open:fade-in-0 motion-safe:data-closed:zoom-out-95 motion-safe:data-open:zoom-in-95 motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=left]:slide-in-from-right-2 motion-safe:data-[side=right]:slide-in-from-left-2 motion-safe:data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-lg p-1 shadow-md ring-1 motion-safe:duration-100 motion-safe:data-[side=inline-start]:slide-in-from-right-2 motion-safe:data-[side=inline-end]:slide-in-from-left-2 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden',
                        className
                    )}
                    {...props}
                />
            </MenuPrimitive.Positioner>
        </DropdownMenuPortal>
    );
}

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
    return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({ className, inset, variant = 'default', ...props }: DropdownMenuItemProps) {
    return (
        <MenuPrimitive.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                `focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuCheckboxItem({ className, children, inset, checked, ...props }: DropdownMenuCheckboxItemProps) {
    return (
        <MenuPrimitive.CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            data-inset={inset}
            className={cn(
                `focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
                className
            )}
            checked={checked}
            {...props}
        >
            <span className="absolute right-2 flex items-center justify-center pointer-events-none">
                <MenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon className="size-4" />
                </MenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </MenuPrimitive.CheckboxItem>
    );
}

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
    return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({ className, children, inset, ...props }: DropdownMenuRadioItemProps) {
    return (
        <MenuPrimitive.RadioItem
            data-slot="dropdown-menu-radio-item"
            data-inset={inset}
            className={cn(
                `focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
                className
            )}
            {...props}
        >
            <span className="absolute right-2 flex items-center justify-center pointer-events-none">
                <MenuPrimitive.RadioItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </MenuPrimitive.RadioItemIndicator>
            </span>
            {children}
        </MenuPrimitive.RadioItem>
    );
}

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
    return (
        <MenuPrimitive.GroupLabel
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn('text-muted-foreground px-1.5 py-1 text-xs font-medium data-inset:pl-7', className)}
            {...props}
        />
    );
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
    return (
        <MenuPrimitive.Separator
            data-slot="dropdown-menu-separator"
            className={cn('bg-border -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                'text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest',
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuSub(props: DropdownMenuSubProps) {
    return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: DropdownMenuSubTriggerProps) {
    return (
        <MenuPrimitive.SubmenuTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                `focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0`,
                className
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto size-4" />
        </MenuPrimitive.SubmenuTrigger>
    );
}

function DropdownMenuSubContent({
    align = 'start',
    alignOffset = 0,
    side = 'right',
    sideOffset = 0,
    className,
    ...props
}: DropdownMenuSubContentProps) {
    return (
        <DropdownMenuContent
            data-slot="dropdown-menu-sub-content"
            className={cn(
                'motion-safe:data-open:animate-in motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 motion-safe:data-open:fade-in-0 motion-safe:data-closed:zoom-out-95 motion-safe:data-open:zoom-in-95 motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=left]:slide-in-from-right-2 motion-safe:data-[side=right]:slide-in-from-left-2 motion-safe:data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-24 rounded-lg p-1 shadow-lg ring-1 motion-safe:duration-100 w-auto',
                className
            )}
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            {...props}
        />
    );
}

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
};
