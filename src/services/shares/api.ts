import type {
    Collaborator,
    MyAccess,
    RemoveCollaboratorPayload,
    ShareQuestionnairePayload,
    ShareStatus,
    UpdateCollaboratorRolePayload,
} from './types';
import { supabase } from '@/lib/@supabase';

// Owner-authoritative share via the SECURITY DEFINER RPC — the only write path
// to questionnaire_shares clients use for sharing. Resolves email -> user id and
// upserts the role's boolean mapping server-side. Returns a status string.
export const shareQuestionnaire = async ({
    questionnaireId,
    email,
    role,
}: ShareQuestionnairePayload): Promise<ShareStatus> => {
    const { data, error } = await supabase.rpc('share_questionnaire', {
        p_questionnaire_id: questionnaireId,
        p_email: email,
        p_role: role,
    });

    if (error) {
        throw error;
    }

    return data as ShareStatus;
};

// Authoritative role of the current user on a questionnaire via the
// SECURITY DEFINER my_access RPC. Null when the user has no access — the route
// guards redirect on that.
export const getMyAccess = async (questionnaireId: string): Promise<MyAccess> => {
    const { data, error } = await supabase.rpc('my_access', {
        p_questionnaire_id: questionnaireId,
    });

    if (error) {
        throw error;
    }

    return (data as MyAccess) ?? null;
};

// Owner lists collaborators for a questionnaire. RLS returns rows only to the
// owner (or the collaborator's own row); the embedded user row is exposed by the
// co-share users policy. Ordered oldest-first for a stable table.
export const getCollaborators = async (questionnaireId: string): Promise<Collaborator[]> => {
    const { data, error } = await supabase
        .from('questionnaire_shares')
        .select('user_id, can_edit, user:users!user_id(email, first_name, last_name, avatar_url)')
        .eq('questionnaire_id', questionnaireId)
        .order('created_at', { ascending: true });

    if (error) {
        throw error;
    }

    return data.map((row) => {
        return {
            userId: row.user_id,
            email: row.user?.email ?? '',
            firstName: row.user?.first_name ?? null,
            lastName: row.user?.last_name ?? null,
            avatarUrl: row.user?.avatar_url ?? null,
            role: row.can_edit ? 'editor' : 'viewer',
        };
    });
};

// Change a collaborator's role. RLS restricts writes to the questionnaire owner.
// Viewer keeps response access (can_view_responses stays true).
export const updateCollaboratorRole = async ({ questionnaireId, userId, role }: UpdateCollaboratorRolePayload) => {
    const { error } = await supabase
        .from('questionnaire_shares')
        .update({ can_edit: role === 'editor', can_view_responses: true })
        .eq('questionnaire_id', questionnaireId)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return { questionnaireId, userId, role };
};

// Revoke all access — deletes the share row (owner-only via RLS).
export const removeCollaborator = async ({ questionnaireId, userId }: RemoveCollaboratorPayload) => {
    const { error } = await supabase
        .from('questionnaire_shares')
        .delete()
        .eq('questionnaire_id', questionnaireId)
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return { questionnaireId, userId };
};
