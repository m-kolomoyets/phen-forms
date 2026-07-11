import type { Questionnaire } from '@/services/questionnaires/types';
import type { QuestionOption, QuestionWithOptions } from '@/services/questions/types';

// Local per-question answer draft. Kept UI-shaped (nullable, string-first) so
// inputs bind directly; converted to the RPC payload + validated with the
// shared zod answer schema at submit time.
export type AnswerDraft =
    | { type: 'single_choice'; optionId: string | null }
    | { type: 'multiple_choice'; optionIds: string[]; otherText: string }
    | { type: 'ranking'; orderedIds: string[] }
    | { type: 'short_text'; text: string }
    | { type: 'long_text'; text: string }
    | { type: 'yes_no'; value: 'yes' | 'no' | null }
    | { type: 'opinion_scale'; value: number | null };

export type AnswerDrafts = Record<string, AnswerDraft>;

export type FillInProps = {
    questionnaire: Questionnaire;
    questions: QuestionWithOptions[];
};

export type QuestionFieldProps = {
    question: QuestionWithOptions;
    // Display-ordered options (shuffled once when the author flagged it).
    options: QuestionOption[];
    draft: AnswerDraft;
    error?: string;
    onChange: (draft: AnswerDraft) => void;
};
