import type { QuestionWithOptions } from '@/services/questions/types';

export type QuestionEditorProps = {
    questionnaireId: string;
    question: QuestionWithOptions;
    onDelete: (question: QuestionWithOptions) => void;
};
