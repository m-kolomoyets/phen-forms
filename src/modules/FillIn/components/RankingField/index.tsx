import type { RankingFieldProps, RankingItemProps } from './types';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function RankingItem({ id, label, rank }: RankingItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex touch-none items-center gap-3 rounded-md border bg-card p-3',
                isDragging && 'z-10 opacity-60'
            )}
        >
            <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                {rank}
            </span>
            <span className="flex-1">{label}</span>
            <button
                type="button"
                aria-label={`Reorder ${label}`}
                className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab p-1 outline-none"
                {...attributes}
                {...listeners}
            >
                <GripVerticalIcon className="size-4" />
            </button>
        </li>
    );
}

function RankingField({ question, orderedIds, onChange }: RankingFieldProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const labels = new Map(
        question.question_options.map((option) => {
            return [option.id, option.label];
        })
    );

    function handleDragEnd(event: Parameters<NonNullable<React.ComponentProps<typeof DndContext>['onDragEnd']>>[0]) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = orderedIds.indexOf(String(active.id));
        const newIndex = orderedIds.indexOf(String(over.id));

        onChange(arrayMove(orderedIds, oldIndex, newIndex));
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                <ol className="flex flex-col gap-2">
                    {orderedIds.map((id, index) => {
                        return <RankingItem key={id} id={id} label={labels.get(id) ?? ''} rank={index + 1} />;
                    })}
                </ol>
            </SortableContext>
        </DndContext>
    );
}

export { RankingField };
