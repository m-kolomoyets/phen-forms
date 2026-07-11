import type { QuestionWithOptions } from '@/services/questions/types';

export type SortableQuestionItemProps = {
    question: QuestionWithOptions;
    index: number;
    total: number;
    active: boolean;
    disabled?: boolean;
    onSelect: (id: string) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
    onDuplicate: (question: QuestionWithOptions) => void;
    onDelete: (question: QuestionWithOptions) => void;
};
