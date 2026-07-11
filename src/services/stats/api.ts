import type { QuestionnaireStats } from './types';
import { supabase } from '@/lib/@supabase';

// Owner-only aggregates via the SECURITY DEFINER RPC. The RPC raises for
// non-owners (surfaced here as a thrown error); RLS keeps raw answers private.
export const getQuestionnaireStats = async (questionnaireId: string) => {
    const { data, error } = await supabase.rpc('get_questionnaire_stats', {
        p_questionnaire_id: questionnaireId,
    });

    if (error) {
        throw error;
    }

    return data as unknown as QuestionnaireStats;
};
