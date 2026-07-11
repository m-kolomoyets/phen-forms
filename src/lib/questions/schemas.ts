import { z } from 'zod';

/**
 * Pure, UI-agnostic zod schemas for the question domain. One discriminated union
 * per concern (authoring config + form, and fill-in answers), keyed by question
 * `type`. Reused by the builder, the public fill-in, and the submit RPC payload.
 */

// --- Authoring: per-type config (mirrors questions.config JSONB) ------------

// single_choice / multiple_choice / ranking share the shuffle flag.
// `allow_other` is only meaningful for multiple_choice (an "Other" option that
// lets respondents type a custom choice); optional + default keeps the other
// choice types unaffected.
export type ChoiceConfig = z.infer<typeof choiceConfigSchema>;
export const choiceConfigSchema = z.object({
    shuffle_options: z.boolean(),
    allow_other: z.boolean().optional().default(false),
});

// short_text / long_text / yes_no carry no settings.
export type EmptyConfig = z.infer<typeof emptyConfigSchema>;
export const emptyConfigSchema = z.object({});

export type OpinionScaleConfig = z.infer<typeof opinionScaleConfigSchema>;
export const opinionScaleConfigSchema = z
    .object({
        scale_min: z.int(),
        scale_max: z.int(),
        scale_step: z
            .int()
            .min(1, {
                error() {
                    return 'Step must be at least 1';
                },
            })
            .default(1),
        min_label: z
            .string()
            .trim()
            .min(1, {
                error() {
                    return 'Low-end label is required';
                },
            }),
        max_label: z
            .string()
            .trim()
            .min(1, {
                error() {
                    return 'High-end label is required';
                },
            }),
    })
    .refine(
        (config) => {
            return config.scale_min < config.scale_max;
        },
        {
            error() {
                return 'Minimum must be less than maximum';
            },
            path: ['scale_max'],
        }
    );

// --- Authoring: option input --------------------------------------------------

export type QuestionOptionInput = z.infer<typeof questionOptionInputSchema>;
export const questionOptionInputSchema = z.object({
    id: z.uuid().optional(),
    label: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Option label is required';
            },
        }),
});

// --- Authoring: question form (discriminated union by type) -------------------

const questionBaseSchema = z.object({
    prompt: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Question prompt is required';
            },
        }),
    description: z.string().trim(),
    required: z.boolean(),
});

const optionsSchema = z.array(questionOptionInputSchema).min(2, {
    error() {
        return 'Add at least two options';
    },
});

export const singleChoiceQuestionSchema = questionBaseSchema.extend({
    type: z.literal('single_choice'),
    config: choiceConfigSchema,
    options: optionsSchema,
});

export const multipleChoiceQuestionSchema = questionBaseSchema.extend({
    type: z.literal('multiple_choice'),
    config: choiceConfigSchema,
    options: optionsSchema,
});

export const rankingQuestionSchema = questionBaseSchema.extend({
    type: z.literal('ranking'),
    config: choiceConfigSchema,
    options: optionsSchema,
});

export const shortTextQuestionSchema = questionBaseSchema.extend({
    type: z.literal('short_text'),
    config: emptyConfigSchema,
});

export const longTextQuestionSchema = questionBaseSchema.extend({
    type: z.literal('long_text'),
    config: emptyConfigSchema,
});

export const yesNoQuestionSchema = questionBaseSchema.extend({
    type: z.literal('yes_no'),
    config: emptyConfigSchema,
});

export const opinionScaleQuestionSchema = questionBaseSchema.extend({
    type: z.literal('opinion_scale'),
    config: opinionScaleConfigSchema,
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
export const questionFormSchema = z.discriminatedUnion('type', [
    singleChoiceQuestionSchema,
    multipleChoiceQuestionSchema,
    shortTextQuestionSchema,
    longTextQuestionSchema,
    yesNoQuestionSchema,
    rankingQuestionSchema,
    opinionScaleQuestionSchema,
]);

// --- Fill-in: answer shape (mirrors server-side submit validation) -----------
// Required-ness / scale bounds are enforced by the submit RPC against config;
// these schemas validate the shape of a *provided* answer.

export const singleChoiceAnswerSchema = z.object({
    type: z.literal('single_choice'),
    option_ids: z.array(z.uuid()).length(1, {
        error() {
            return 'Select one option';
        },
    }),
});

// option_ids may be empty when only the "Other" free-text choice is filled;
// the cross-field "at least one of" rule is enforced on the union below.
export const multipleChoiceAnswerSchema = z.object({
    type: z.literal('multiple_choice'),
    option_ids: z.array(z.uuid()),
    other_text: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Enter your answer';
            },
        })
        .optional(),
});

export const rankingAnswerSchema = z.object({
    type: z.literal('ranking'),
    option_ids: z.array(z.uuid()).min(1, {
        error() {
            return 'Rank the options';
        },
    }),
});

export const shortTextAnswerSchema = z.object({
    type: z.literal('short_text'),
    text: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Enter an answer';
            },
        }),
});

export const longTextAnswerSchema = z.object({
    type: z.literal('long_text'),
    text: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Enter an answer';
            },
        }),
});

export const yesNoAnswerSchema = z.object({
    type: z.literal('yes_no'),
    value: z.enum(['yes', 'no']),
});

export const opinionScaleAnswerSchema = z.object({
    type: z.literal('opinion_scale'),
    value: z.int(),
});

export type AnswerValues = z.infer<typeof answerSchema>;
export const answerSchema = z
    .discriminatedUnion('type', [
        singleChoiceAnswerSchema,
        multipleChoiceAnswerSchema,
        shortTextAnswerSchema,
        longTextAnswerSchema,
        yesNoAnswerSchema,
        rankingAnswerSchema,
        opinionScaleAnswerSchema,
    ])
    .superRefine((answer, ctx) => {
        // multiple_choice needs at least one picked option OR an "Other" text.
        if (answer.type === 'multiple_choice' && answer.option_ids.length === 0 && answer.other_text === undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Select at least one option',
                path: ['option_ids'],
            });
        }
    });
