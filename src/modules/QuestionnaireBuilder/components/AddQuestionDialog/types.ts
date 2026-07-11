import type { QuestionType } from '@/lib/questions/constants';

export type AddQuestionDialogProps = {
    onSelect: (type: QuestionType) => void;
};
