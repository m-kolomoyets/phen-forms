import type {
    AdminQuestionnaireListItem,
    AdminUserListItem,
    TransferOwnershipPayload,
    TransferOwnershipStatus,
} from './types';
import { supabase } from '@/lib/@supabase';

// Every user plus an isAdmin flag. The flag comes from admin_users (unreadable
// directly), surfaced only through this SECURITY DEFINER RPC gated on is_admin().
export const getAdminUsers = async (): Promise<AdminUserListItem[]> => {
    const { data, error } = await supabase.rpc('admin_list_users');

    if (error) {
        throw error;
    }

    return (data ?? []) as unknown as AdminUserListItem[];
};

// Whether the current user has app-level admin. Backs the hidden /admin route
// guard. The SECURITY DEFINER am_i_admin RPC returns false for non-admins (never
// an error), so this reveals nothing about the flow. RLS is the real boundary —
// this only decides whether to render the admin shell.
export const getAmIAdmin = async (): Promise<boolean> => {
    const { data, error } = await supabase.rpc('am_i_admin');

    if (error) {
        throw error;
    }

    return data ?? false;
};

// Every questionnaire, owner shown. This is a PLAIN select that relies on the
// admin SELECT policies to widen — for a non-admin RLS returns only their own rows,
// so this is safe to ship, but it is only ever called from the guarded admin route.
// The embedded counts / owner / shares resources widen for admins via their own
// admin SELECT policies.
export const getAllQuestionnaires = async (): Promise<AdminQuestionnaireListItem[]> => {
    const { data, error } = await supabase
        .from('questionnaires')
        .select(
            '*, questions(count), responses(count), owner:users!owner_id(id, email, first_name, last_name, avatar_url), shares:questionnaire_shares(user_id)'
        )
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data.map(({ questions, responses, owner, shares, ...questionnaire }) => {
        return {
            ...questionnaire,
            questionsCount: questions[0]?.count ?? 0,
            responsesCount: responses[0]?.count ?? 0,
            sharesCount: shares.length,
            owner,
        };
    });
};

// Reassign ownership via the SECURITY DEFINER RPC — the only path that changes
// owner_id. Verifies admin server-side, swaps the owner, and drops the new owner's
// redundant share row. Returns a status string.
export const transferOwnership = async ({
    questionnaireId,
    newOwnerId,
}: TransferOwnershipPayload): Promise<TransferOwnershipStatus> => {
    const { data, error } = await supabase.rpc('admin_transfer_ownership', {
        p_questionnaire_id: questionnaireId,
        p_new_owner: newOwnerId,
    });

    if (error) {
        throw error;
    }

    return data as TransferOwnershipStatus;
};
