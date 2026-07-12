import type { Questionnaire, QuestionnaireOwner } from '@/services/questionnaires/types';
import type { User } from '@/services/users/types';

export type AdminUserListItem = User & {
    isAdmin: boolean;
};

export type TransferOwnershipStatus = 'transferred' | 'forbidden' | 'not_found' | 'no_user' | 'noop';

export type TransferOwnershipPayload = {
    questionnaireId: string;
    newOwnerId: string;
};

// Global-list item for the admin questionnaires screen. Unlike the normal
// QuestionnaireListItem there is no per-user `role`: admin sees every questionnaire
// and the owner is always shown.
export type AdminQuestionnaireListItem = Questionnaire & {
    questionsCount: number;
    responsesCount: number;
    sharesCount: number;
    owner: QuestionnaireOwner | null;
};
