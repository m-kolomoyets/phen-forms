import type { Modifier } from '@dnd-kit/core';
import type { Json } from '@/lib/database.types';
import type { QuestionType } from '@/lib/questions/constants';
import type { QuestionWithOptions } from '@/services/questions/types';
import { isOptionQuestionType } from '@/lib/questions/constants';

// Lock drag movement to the vertical axis (shared by question list + options DnD).
export const restrictToVerticalAxis: Modifier = ({ transform }) => {
    return { ...transform, x: 0 };
};

// Client-only id so option rows have stable sortable/React keys before the
// server assigns real ones. Stripped to `{ label }` on save.
const createEmptyOption = (): QuestionFormState['options'][number] => {
    return { id: crypto.randomUUID(), label: '' };
};

/**
 * Flat superset form state. The builder edits one fixed `type` at a time, so a
 * single shape holding every possible field keeps field names statically typed
 * (no discriminated-union DeepKeys). `questionFormSchema` validates the shape
 * per type on submit; irrelevant keys are stripped by zod.
 */
export type QuestionFormState = {
    type: QuestionType;
    prompt: string;
    description: string;
    required: boolean;
    config: {
        shuffle_options: boolean;
        allow_other: boolean;
        scale_min: number;
        scale_max: number;
        scale_step: number;
        min_label: string;
        max_label: string;
    };
    options: { id?: string; label: string }[];
};

const BASE_CONFIG: QuestionFormState['config'] = {
    shuffle_options: false,
    allow_other: false,
    scale_min: 1,
    scale_max: 10,
    scale_step: 1,
    min_label: '',
    max_label: '',
};

export const getDefaultQuestionFormState = (type: QuestionType): QuestionFormState => {
    return {
        type,
        prompt: '',
        description: '',
        required: false,
        config: { ...BASE_CONFIG },
        options: isOptionQuestionType(type) ? [createEmptyOption(), createEmptyOption()] : [],
    };
};

/**
 * Switch a question to `nextType`, carrying over whatever the target type can
 * reuse. Prompt/description/required always transfer. Options + shuffle carry
 * between option-backed types; everything else resets to defaults.
 */
export const changeQuestionType = (current: QuestionFormState, nextType: QuestionType): QuestionFormState => {
    const next = getDefaultQuestionFormState(nextType);

    next.prompt = current.prompt;
    next.description = current.description;
    next.required = current.required;

    if (isOptionQuestionType(nextType) && isOptionQuestionType(current.type)) {
        next.options = current.options.map((option) => {
            return { ...option };
        });
        next.config.shuffle_options = current.config.shuffle_options;
        next.config.allow_other = current.config.allow_other;
    }

    return next;
};

export const toQuestionFormState = (question: QuestionWithOptions): QuestionFormState => {
    const config = (question.config ?? {}) as Partial<QuestionFormState['config']>;

    return {
        type: question.type,
        prompt: question.prompt,
        description: question.description ?? '',
        required: question.required,
        config: {
            shuffle_options: config.shuffle_options ?? false,
            allow_other: config.allow_other ?? false,
            scale_min: config.scale_min ?? BASE_CONFIG.scale_min,
            scale_max: config.scale_max ?? BASE_CONFIG.scale_max,
            scale_step: config.scale_step ?? BASE_CONFIG.scale_step,
            min_label: config.min_label ?? '',
            max_label: config.max_label ?? '',
        },
        options: question.question_options.map((option) => {
            return { id: option.id, label: option.label };
        }),
    };
};

// Build the type-specific config JSON persisted to questions.config.
export const buildQuestionConfig = (state: QuestionFormState): Json => {
    switch (state.type) {
        case 'single_choice':
        case 'ranking':
            return { shuffle_options: state.config.shuffle_options };
        case 'multiple_choice':
            return {
                shuffle_options: state.config.shuffle_options,
                allow_other: state.config.allow_other,
            };
        case 'opinion_scale':
            return {
                scale_min: state.config.scale_min,
                scale_max: state.config.scale_max,
                scale_step: state.config.scale_step,
                min_label: state.config.min_label,
                max_label: state.config.max_label,
            };
        default:
            return {};
    }
};
