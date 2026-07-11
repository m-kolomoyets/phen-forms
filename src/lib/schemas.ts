import { z } from 'zod';

export type EnvSchema = z.infer<typeof envSchema>;
export const envSchema = z.object({
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string(),
});
