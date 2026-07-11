import { z } from 'zod';

export type QuestionnaireMetaSchema = z.infer<typeof questionnaireMetaSchema>;
export const questionnaireMetaSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Title is required';
            },
        }),
    description: z.string().trim(),
});

export type ShareSchema = z.infer<typeof shareSchema>;
export const shareSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, {
            error() {
                return 'Email is required';
            },
        })
        .pipe(
            z.email({
                error() {
                    return 'Enter a valid email';
                },
            })
        ),
    role: z.enum(['editor', 'viewer']),
});
