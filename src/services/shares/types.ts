export type ShareRole = 'editor' | 'viewer';

export type ShareStatus = 'shared' | 'not_found' | 'self' | 'forbidden';

// Current user's role on a questionnaire; null when they have no access.
export type MyAccess = 'owner' | 'editor' | 'viewer' | null;

export type ShareQuestionnairePayload = {
    questionnaireId: string;
    email: string;
    role: ShareRole;
};

export type Collaborator = {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    role: ShareRole;
};

export type UpdateCollaboratorRolePayload = {
    questionnaireId: string;
    userId: string;
    role: ShareRole;
};

export type RemoveCollaboratorPayload = {
    questionnaireId: string;
    userId: string;
};
