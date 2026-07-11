import type { Switch as SwitchPrimitive } from '@base-ui/react/switch';

export type SwitchProps = SwitchPrimitive.Root.Props & {
    size?: 'sm' | 'default';
};
