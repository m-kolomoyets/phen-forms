import type { DragEndEvent } from '@dnd-kit/core';
import type { QuestionListProps } from './types';
import { useState } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { restrictToVerticalAxis } from '../../constants';
import { SortableQuestionItem } from './components/SortableQuestionItem';
import { AddQuestionDialog } from '../AddQuestionDialog';
import { ScreenSection } from '../ScreenSection';

function QuestionList({
    questionnaire,
    questions,
    selectedId,
    disabled,
    onSelect,
    onReorder,
    onDuplicate,
    onDelete,
    onAdd,
}: QuestionListProps) {
    const serverIds = questions.map((question) => {
        return question.id;
    });

    // Local order for snappy drag; resynced whenever the server list changes.
    const [items, setItems] = useState(serverIds);
    const [seen, setSeen] = useState(serverIds.join(','));

    if (seen !== serverIds.join(',')) {
        setItems(serverIds);
        setSeen(serverIds.join(','));
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const next = arrayMove(items, oldIndex, newIndex);

        setItems(next);
        onReorder(next);
    };

    const handleMove = (id: string, direction: 'up' | 'down') => {
        const index = items.indexOf(id);
        const target = direction === 'up' ? index - 1 : index + 1;

        if (target < 0 || target >= items.length) {
            return;
        }

        const next = arrayMove(items, index, target);

        setItems(next);
        onReorder(next);
    };

    const byId = new Map(
        questions.map((question) => {
            return [question.id, question];
        })
    );

    return (
        <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-hidden rounded-xl border p-3">
            <ScreenSection kind="welcome" questionnaire={questionnaire} />

            <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium">Questions</span>
                <span className="text-muted-foreground text-xs">{questions.length}</span>
            </div>

            <ScrollArea fade className="-ml-1 min-h-0 flex-1">
                <div className="pr-3 pl-1">
                    {questions.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                <ul className="flex flex-col gap-2">
                                    {items.map((id, index) => {
                                        const question = byId.get(id);

                                        if (!question) {
                                            return null;
                                        }

                                        return (
                                            <SortableQuestionItem
                                                key={id}
                                                question={question}
                                                index={index}
                                                total={items.length}
                                                active={id === selectedId}
                                                disabled={disabled}
                                                onSelect={onSelect}
                                                onMove={handleMove}
                                                onDuplicate={onDuplicate}
                                                onDelete={onDelete}
                                            />
                                        );
                                    })}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <p className="text-muted-foreground py-4 text-xs">No questions yet.</p>
                    )}
                </div>
            </ScrollArea>

            <AddQuestionDialog onSelect={onAdd} />

            <ScreenSection kind="ending" questionnaire={questionnaire} />
        </aside>
    );
}

export { QuestionList };
