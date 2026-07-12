import type { CreateQuestionnairePayload, QuestionnaireListItem, UpdateQuestionnairePayload } from './types';
import { supabase } from '@/lib/@supabase';

// The normal list is deliberately an RPC, not a plain `.select()`: list_my_questionnaires
// is explicitly scoped to owned + shared-with-me rows and so is immune to the admin
// SELECT widening (a plain select would leak every questionnaire to an admin here).
// The RPC assembles the full list-item shape (counts, owner, role, sharesCount)
// server-side, so there is no client-side role/count assembly anymore.
export const getQuestionnaires = async (): Promise<QuestionnaireListItem[]> => {
    const { data, error } = await supabase.rpc('list_my_questionnaires');

    if (error) {
        throw error;
    }

    return (data ?? []) as unknown as QuestionnaireListItem[];
};

export const getQuestionnaire = async (id: string) => {
    const { data, error } = await supabase.from('questionnaires').select('*').eq('id', id).single();

    if (error) {
        throw error;
    }

    return data;
};

// Anonymous read path for the public fill-in. RLS exposes only published
// questionnaires to anon, so a draft/closed/missing id returns null — the
// fill-in shows an "unavailable" screen instead of erroring.
export const getPublicQuestionnaire = async (id: string) => {
    const { data, error } = await supabase.from('questionnaires').select('*').eq('id', id).maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

export const createQuestionnaire = async (payload: CreateQuestionnairePayload) => {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        throw new Error('Not authenticated.');
    }

    const { data, error } = await supabase
        .from('questionnaires')
        .insert({ ...payload, owner_id: user.id })
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const updateQuestionnaire = async ({ id, ...payload }: UpdateQuestionnairePayload) => {
    const { data, error } = await supabase.from('questionnaires').update(payload).eq('id', id).select('*').single();

    if (error) {
        throw error;
    }

    return data;
};

export const deleteQuestionnaire = async (id: string) => {
    const { error } = await supabase.from('questionnaires').delete().eq('id', id);

    if (error) {
        throw error;
    }

    return id;
};
