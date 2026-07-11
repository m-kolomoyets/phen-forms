import type { SortableOptionItemProps } from './types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

function SortableOptionItem({
    id,
    draggable,
    canRemove,
    removeLabel,
    marker,
    children,
    onRemove,
}: SortableOptionItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: !draggable,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('flex items-center gap-2 touch-none', isDragging && 'z-10 opacity-60')}
        >
            {draggable && (
                <button
                    type="button"
                    ref={setActivatorNodeRef}
                    aria-label="Drag to reorder option"
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab p-1 outline-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVerticalIcon className="size-4" />
                </button>
            )}
            {marker}
            <div className="flex-1">{children}</div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={removeLabel}
                disabled={!canRemove}
                onClick={onRemove}
            >
                <Trash2Icon />
            </Button>
        </div>
    );
}

export { SortableOptionItem };
