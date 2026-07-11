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
