import { z } from 'zod';

export type QuestionnaireDetailsSchema = z.infer<typeof questionnaireDetailsSchema>;
export const questionnaireDetailsSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim(),
});

export type QuestionnaireSettingsSchema = z.infer<typeof questionnaireSettingsSchema>;
export const questionnaireSettingsSchema = z.object({
    randomize_questions: z.boolean(),
    show_welcome: z.boolean(),
    welcome_title: z.string().trim(),
    welcome_description: z.string().trim(),
    welcome_bg_url: z.union([
        z.literal(''),
        z.url({
            error() {
                return 'Enter a valid URL';
            },
        }),
    ]),
});

// Shared shape for editing a single welcome/ending screen.
export type QuestionnaireScreenSchema = z.infer<typeof questionnaireScreenSchema>;
export const questionnaireScreenSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim(),
    bg_url: z.union([
        z.literal(''),
        z.url({
            error() {
                return 'Enter a valid URL';
            },
        }),
    ]),
});
