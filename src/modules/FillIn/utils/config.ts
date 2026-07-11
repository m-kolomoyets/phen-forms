import type { Json } from '@/lib/database.types';
import type { ChoiceConfig, OpinionScaleConfig } from '@/lib/questions/schemas';
import { choiceConfigSchema, opinionScaleConfigSchema } from '@/lib/questions/schemas';

// Config JSONB is authored by the builder against these schemas; fall back to
// safe defaults so a malformed row never crashes the public fill-in.
export const getChoiceConfig = (config: Json): ChoiceConfig => {
    const parsed = choiceConfigSchema.safeParse(config);

    return parsed.success ? parsed.data : { shuffle_options: false, allow_other: false };
};

export const getScaleConfig = (config: Json): OpinionScaleConfig => {
    const parsed = opinionScaleConfigSchema.safeParse(config);

    return parsed.success
        ? parsed.data
        : { scale_min: 1, scale_max: 10, scale_step: 1, min_label: 'Low', max_label: 'High' };
};

// Inclusive min..max stepped values for the opinion-scale segmented control.
export const getScaleValues = (config: OpinionScaleConfig): number[] => {
    const values: number[] = [];

    for (let value = config.scale_min; value <= config.scale_max; value += config.scale_step) {
        values.push(value);
    }

    return values;
};
