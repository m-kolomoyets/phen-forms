import type { Database, Json } from '@/lib/database.types';

export type { QuestionType } from '@/lib/questions/constants';

export type Question = Database['public']['Tables']['questions']['Row'];

export type QuestionOption = Database['public']['Tables']['question_options']['Row'];

export type QuestionWithOptions = Question & {
    question_options: QuestionOption[];
};

export type QuestionOptionInput = {
    id?: string;
    label: string;
};

export type CreateQuestionPayload = {
    questionnaire_id: string;
    type: Question['type'];
    prompt: string;
    description: string | null;
    required: boolean;
    config: Json;
    options: QuestionOptionInput[];
};

export type UpdateQuestionPayload = {
    id: string;
} & Omit<CreateQuestionPayload, 'questionnaire_id'>;

export type ReorderQuestionsPayload = {
    questionnaireId: string;
    orderedIds: string[];
};
