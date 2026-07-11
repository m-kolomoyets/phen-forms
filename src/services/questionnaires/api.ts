import type { CreateQuestionnairePayload, QuestionnaireRole, UpdateQuestionnairePayload } from './types';
import { supabase } from '@/lib/@supabase';

export const getQuestionnaires = async () => {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    // RLS returns owned + shared-with-me rows. The embedded shares resource is
    // owner-scoped by its own policy: for an owned questionnaire it returns every
    // collaborator (drives "Shared with N"); for a shared-with-me one it returns
    // only my row (drives my role).
    const { data, error } = await supabase
        .from('questionnaires')
        .select(
            '*, questions(count), responses(count), owner:users!owner_id(id, email, first_name, last_name, avatar_url), shares:questionnaire_shares(user_id, can_edit)'
        )
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    const myId = user?.id ?? null;

    return data.map(({ questions, responses, owner, shares, ...questionnaire }) => {
        const isOwner = questionnaire.owner_id === myId;
        const myShare = shares.find((share) => {
            return share.user_id === myId;
        });

        const sharedRole: QuestionnaireRole = myShare?.can_edit ? 'editor' : 'viewer';
        const role: QuestionnaireRole = isOwner ? 'owner' : sharedRole;

        return {
            ...questionnaire,
            questionsCount: questions[0]?.count ?? 0,
            responsesCount: responses[0]?.count ?? 0,
            owner,
            role,
            sharesCount: shares.length,
        };
    });
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
