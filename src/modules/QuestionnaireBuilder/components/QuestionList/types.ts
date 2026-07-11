import type { QuestionType } from '@/lib/questions/constants';
import type { Questionnaire } from '@/services/questionnaires/types';
import type { QuestionWithOptions } from '@/services/questions/types';

export type QuestionListProps = {
    questionnaire: Questionnaire;
    questions: QuestionWithOptions[];
    selectedId?: string;
    disabled?: boolean;
    onSelect: (id: string) => void;
    onReorder: (orderedIds: string[]) => void;
    onDuplicate: (question: QuestionWithOptions) => void;
    onDelete: (question: QuestionWithOptions) => void;
    onAdd: (type: QuestionType) => void;
};
