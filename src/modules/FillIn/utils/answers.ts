import type { QuestionWithOptions } from '@/services/questions/types';
import type { SubmitAnswer } from '@/services/responses/types';
import type { AnswerDraft } from '../types';
import { answerSchema } from '@/lib/questions/schemas';
import { getChoiceConfig } from './config';
import { shuffle } from './shuffle';

// Empty draft per type. Ranking starts as the full option set (shuffled when the
// author flagged it) since the answer is the ordering itself.
export const initDraft = (question: QuestionWithOptions): AnswerDraft => {
    switch (question.type) {
        case 'single_choice': {
            return { type: 'single_choice', optionId: null };
        }
        case 'multiple_choice': {
            return { type: 'multiple_choice', optionIds: [], otherText: '' };
        }
        case 'ranking': {
            const ids = question.question_options.map((option) => {
                return option.id;
            });
            const ordered = getChoiceConfig(question.config).shuffle_options ? shuffle(ids) : ids;

            return { type: 'ranking', orderedIds: ordered };
        }
        case 'short_text': {
            return { type: 'short_text', text: '' };
        }
        case 'long_text': {
            return { type: 'long_text', text: '' };
        }
        case 'yes_no': {
            return { type: 'yes_no', value: null };
        }
        case 'opinion_scale': {
            return { type: 'opinion_scale', value: null };
        }
    }
};

// Whether the respondent has provided anything — drives required-question
// enforcement. Ranking is always "answered" (it has a default ordering).
export const isAnswered = (draft: AnswerDraft): boolean => {
    switch (draft.type) {
        case 'single_choice': {
            return draft.optionId !== null;
        }
        case 'multiple_choice': {
            return draft.optionIds.length > 0 || draft.otherText.trim() !== '';
        }
        case 'ranking': {
            return draft.orderedIds.length > 0;
        }
        case 'short_text':
        case 'long_text': {
            return draft.text.trim() !== '';
        }
        case 'yes_no': {
            return draft.value !== null;
        }
        case 'opinion_scale': {
            return draft.value !== null;
        }
    }
};

// Validate an *answered* draft against the shared zod answer schema (shape only;
// required-ness is enforced separately). Returns an error message or null.
export const validateDraft = (question: QuestionWithOptions, draft: AnswerDraft): string | null => {
    if (question.required && !isAnswered(draft)) {
        return 'This question is required';
    }

    if (!isAnswered(draft)) {
        return null;
    }

    const parsed = answerSchema.safeParse(toAnswerValues(draft));

    if (!parsed.success) {
        return parsed.error.issues[0]?.message ?? 'Invalid answer';
    }

    return null;
};

// Draft → shared zod answer union input, for validation.
const toAnswerValues = (draft: AnswerDraft) => {
    switch (draft.type) {
        case 'single_choice': {
            return { type: draft.type, option_ids: draft.optionId ? [draft.optionId] : [] };
        }
        case 'multiple_choice': {
            const otherText = draft.otherText.trim();

            return {
                type: draft.type,
                option_ids: draft.optionIds,
                other_text: otherText === '' ? undefined : otherText,
            };
        }
        case 'ranking': {
            return { type: draft.type, option_ids: draft.orderedIds };
        }
        case 'short_text':
        case 'long_text': {
            return { type: draft.type, text: draft.text };
        }
        case 'yes_no': {
            return { type: draft.type, value: draft.value ?? undefined };
        }
        case 'opinion_scale': {
            return { type: draft.type, value: draft.value ?? undefined };
        }
    }
};

// Draft → submit_response RPC payload entry. Returns null for unanswered
// optional questions so they are omitted from the submission.
export const toSubmitAnswer = (questionId: string, draft: AnswerDraft): SubmitAnswer | null => {
    if (!isAnswered(draft)) {
        return null;
    }

    switch (draft.type) {
        case 'single_choice': {
            return { question_id: questionId, value_options: draft.optionId ? [draft.optionId] : [] };
        }
        case 'multiple_choice': {
            const otherText = draft.otherText.trim();

            return {
                question_id: questionId,
                value_options: draft.optionIds,
                value_text: otherText === '' ? null : otherText,
            };
        }
        case 'ranking': {
            return { question_id: questionId, value_options: draft.orderedIds };
        }
        case 'short_text':
        case 'long_text': {
            return { question_id: questionId, value_text: draft.text.trim() };
        }
        case 'yes_no': {
            return { question_id: questionId, value_text: draft.value };
        }
        case 'opinion_scale': {
            return { question_id: questionId, value_number: draft.value };
        }
    }
};
