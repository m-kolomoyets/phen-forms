import type { Json } from '@/lib/database.types';
import type { ResponseWithAnswers, SubmitResponsePayload } from './types';
import { supabase } from '@/lib/@supabase';

// Public submission goes through the SECURITY DEFINER RPC — the only write path
// anon has to responses/answers. Server does all authoritative validation.
export const submitResponse = async ({ questionnaireId, answers }: SubmitResponsePayload) => {
    const { data, error } = await supabase.rpc('submit_response', {
        p_questionnaire_id: questionnaireId,
        p_answers: answers as unknown as Json,
    });

    if (error) {
        throw error;
    }

    return data;
};

// Owner fetches raw submissions + answers (RLS restricts to their own). Feeds the
// raw table view and CSV/XLSX export. Ordered oldest-first for a stable table.
export const getResponses = async (questionnaireId: string): Promise<ResponseWithAnswers[]> => {
    const { data, error } = await supabase
        .from('responses')
        .select('id, submitted_at, answers(*)')
        .eq('questionnaire_id', questionnaireId)
        .order('submitted_at', { ascending: true });

    if (error) {
        throw error;
    }

    return data;
};
