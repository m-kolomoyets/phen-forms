import type { SortableQuestionItemProps } from './types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CopyIcon,
    GripVerticalIcon,
    MoreVerticalIcon,
    MoveIcon,
    Trash2Icon,
} from 'lucide-react';
import { QUESTION_TYPE_ICON, QUESTION_TYPE_LABEL } from '@/lib/questions/constants';
import { cn } from '@/lib/utils/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

function SortableQuestionItem({
    question,
    index,
    total,
    active,
    disabled,
    onSelect,
    onMove,
    onDuplicate,
    onDelete,
}: SortableQuestionItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const Icon = QUESTION_TYPE_ICON[question.type];

    return (
        <li ref={setNodeRef} style={style} className={cn('touch-none', isDragging && 'z-10 opacity-60')}>
            <div
                className={cn(
                    'group flex items-center gap-1 rounded-lg border p-2 transition-colors',
                    active ? 'border-primary bg-accent' : 'hover:bg-accent/50'
                )}
            >
                <button
                    type="button"
                    ref={setActivatorNodeRef}
                    aria-label="Drag to reorder"
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab p-1 outline-none disabled:cursor-not-allowed"
                    disabled={disabled}
                    {...attributes}
                    {...listeners}
                >
                    <GripVerticalIcon className="size-4" />
                </button>
                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
                    onClick={() => {
                        onSelect(question.id);
                    }}
                >
                    <span className="bg-muted text-muted-foreground flex gap-1.5 py-1 px-1.5 shrink-0 items-center justify-center rounded-md [&_svg]:size-4">
                        <span className="text-muted-foreground shrink-0 text-xs tabular-nums font-semibold">
                            {index + 1}
                        </span>
                        <Icon />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{question.prompt || 'Untitled question'}</span>
                        <span className="text-muted-foreground text-xs">{QUESTION_TYPE_LABEL[question.type]}</span>
                    </span>
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label="Question actions"
                        className={cn(
                            'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 shrink-0 rounded-md p-1 opacity-0 outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-2 group-hover:opacity-100 group-focus-within:opacity-100 data-popup-open:opacity-100',
                            active && 'opacity-100'
                        )}
                    >
                        <MoreVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <MoveIcon />
                                Move
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem
                                    disabled={index === 0}
                                    onClick={() => {
                                        onMove(question.id, 'up');
                                    }}
                                >
                                    <ArrowUpIcon />
                                    Move up
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={index === total - 1}
                                    onClick={() => {
                                        onMove(question.id, 'down');
                                    }}
                                >
                                    <ArrowDownIcon />
                                    Move down
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                            onClick={() => {
                                onDuplicate(question);
                            }}
                        >
                            <CopyIcon />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                                onDelete(question);
                            }}
                        >
                            <Trash2Icon />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </li>
    );
}

export { SortableQuestionItem };
