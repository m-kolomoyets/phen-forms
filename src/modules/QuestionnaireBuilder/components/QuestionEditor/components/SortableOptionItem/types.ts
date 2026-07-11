import type { ReactNode } from 'react';

export type SortableOptionItemProps = {
    id: string;
    draggable: boolean;
    canRemove: boolean;
    removeLabel: string;
    marker: ReactNode;
    children: ReactNode;
    onRemove: () => void;
};
