import { describe, expect, it } from 'vitest';
import { answerSchema, opinionScaleConfigSchema, questionFormSchema } from './schemas';

const OPTION_A = '11111111-1111-4111-8111-111111111111';
const OPTION_B = '22222222-2222-4222-8222-222222222222';

const base = {
    prompt: 'A question',
    description: '',
    required: true,
};

const withOptions = {
    config: { shuffle_options: false },
    options: [{ label: 'A' }, { label: 'B' }],
};

// --- Authoring config -------------------------------------------------------

describe('opinionScaleConfigSchema', () => {
    const valid = { scale_min: 1, scale_max: 10, min_label: 'Low', max_label: 'High' };

    it('accepts a valid scale config', () => {
        expect(opinionScaleConfigSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects min >= max', () => {
        expect(opinionScaleConfigSchema.safeParse({ ...valid, scale_min: 10, scale_max: 10 }).success).toBe(false);
        expect(opinionScaleConfigSchema.safeParse({ ...valid, scale_min: 11, scale_max: 10 }).success).toBe(false);
    });

    it('rejects missing end labels', () => {
        expect(opinionScaleConfigSchema.safeParse({ ...valid, min_label: '' }).success).toBe(false);
        expect(opinionScaleConfigSchema.safeParse({ ...valid, max_label: '  ' }).success).toBe(false);
    });

    it('rejects non-integer bounds', () => {
        expect(opinionScaleConfigSchema.safeParse({ ...valid, scale_max: 5.5 }).success).toBe(false);
    });

    it('defaults step to 1 when omitted', () => {
        const result = opinionScaleConfigSchema.safeParse(valid);

        expect(result.success).toBe(true);
        expect(result.data?.scale_step).toBe(1);
    });

    it('rejects step below 1', () => {
        expect(opinionScaleConfigSchema.safeParse({ ...valid, scale_step: 0 }).success).toBe(false);
    });
});

// --- Authoring question forms (per type) ------------------------------------

describe('questionFormSchema — option-bearing types', () => {
    const optionTypes = ['single_choice', 'multiple_choice', 'ranking'] as const;

    it.each(optionTypes)('accepts a valid %s question', (type) => {
        expect(questionFormSchema.safeParse({ ...base, ...withOptions, type }).success).toBe(true);
    });

    it.each(optionTypes)('rejects %s with fewer than two options', (type) => {
        const result = questionFormSchema.safeParse({ ...base, ...withOptions, type, options: [{ label: 'A' }] });

        expect(result.success).toBe(false);
    });

    it.each(optionTypes)('rejects %s with an empty option label', (type) => {
        const result = questionFormSchema.safeParse({
            ...base,
            ...withOptions,
            type,
            options: [{ label: 'A' }, { label: '  ' }],
        });

        expect(result.success).toBe(false);
    });
});

describe('questionFormSchema — simple types', () => {
    const simpleTypes = ['short_text', 'long_text', 'yes_no'] as const;

    it.each(simpleTypes)('accepts a valid %s question with empty config', (type) => {
        expect(questionFormSchema.safeParse({ ...base, type, config: {} }).success).toBe(true);
    });

    it('rejects an empty prompt', () => {
        expect(questionFormSchema.safeParse({ ...base, type: 'short_text', config: {}, prompt: '   ' }).success).toBe(
            false
        );
    });
});

describe('questionFormSchema — opinion_scale', () => {
    const validScale = {
        ...base,
        type: 'opinion_scale' as const,
        config: { scale_min: 1, scale_max: 10, min_label: 'Low', max_label: 'High' },
    };

    it('accepts a valid opinion_scale question', () => {
        expect(questionFormSchema.safeParse(validScale).success).toBe(true);
    });

    it('rejects an invalid scale (min >= max)', () => {
        const result = questionFormSchema.safeParse({
            ...validScale,
            config: { ...validScale.config, scale_min: 10, scale_max: 1 },
        });

        expect(result.success).toBe(false);
    });
});

it('rejects an unknown question type', () => {
    expect(questionFormSchema.safeParse({ ...base, ...withOptions, type: 'mystery' }).success).toBe(false);
});

// --- Fill-in answers (per type) ---------------------------------------------

describe('answerSchema', () => {
    it('single_choice accepts exactly one option id', () => {
        expect(answerSchema.safeParse({ type: 'single_choice', option_ids: [OPTION_A] }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'single_choice', option_ids: [] }).success).toBe(false);
        expect(answerSchema.safeParse({ type: 'single_choice', option_ids: [OPTION_A, OPTION_B] }).success).toBe(false);
    });

    it('multiple_choice accepts one or more option ids', () => {
        expect(answerSchema.safeParse({ type: 'multiple_choice', option_ids: [OPTION_A, OPTION_B] }).success).toBe(
            true
        );
        expect(answerSchema.safeParse({ type: 'multiple_choice', option_ids: [] }).success).toBe(false);
    });

    it('multiple_choice accepts an "Other" free-text answer', () => {
        expect(answerSchema.safeParse({ type: 'multiple_choice', option_ids: [], other_text: 'Custom' }).success).toBe(
            true
        );
        expect(
            answerSchema.safeParse({ type: 'multiple_choice', option_ids: [OPTION_A], other_text: 'Custom' }).success
        ).toBe(true);
        expect(answerSchema.safeParse({ type: 'multiple_choice', option_ids: [], other_text: '  ' }).success).toBe(
            false
        );
    });

    it('ranking accepts an ordered list of option ids', () => {
        expect(answerSchema.safeParse({ type: 'ranking', option_ids: [OPTION_B, OPTION_A] }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'ranking', option_ids: [] }).success).toBe(false);
    });

    it('rejects a non-uuid option id', () => {
        expect(answerSchema.safeParse({ type: 'single_choice', option_ids: ['not-a-uuid'] }).success).toBe(false);
    });

    it('short_text / long_text require non-empty text', () => {
        expect(answerSchema.safeParse({ type: 'short_text', text: 'hi' }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'long_text', text: 'detailed' }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'short_text', text: '   ' }).success).toBe(false);
    });

    it('yes_no accepts only yes or no', () => {
        expect(answerSchema.safeParse({ type: 'yes_no', value: 'yes' }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'yes_no', value: 'no' }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'yes_no', value: 'maybe' }).success).toBe(false);
    });

    it('opinion_scale accepts an integer value', () => {
        expect(answerSchema.safeParse({ type: 'opinion_scale', value: 7 }).success).toBe(true);
        expect(answerSchema.safeParse({ type: 'opinion_scale', value: 7.5 }).success).toBe(false);
    });
});
