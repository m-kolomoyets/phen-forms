import type { CreateQuestionnairePayload, UpdateQuestionnairePayload } from './types';
import { supabase } from '@/lib/@supabase';

export const getQuestionnaires = async () => {
    const { data, error } = await supabase.from('questionnaires').select('*').order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

export const getQuestionnaire = async (id: string) => {
    const { data, error } = await supabase.from('questionnaires').select('*').eq('id', id).single();

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
