export type ShareRole = 'editor' | 'viewer';

export type ShareStatus = 'shared' | 'not_found' | 'self' | 'forbidden';

// Current user's role on a questionnaire; null when they have no access.
// 'admin' is the app-level override, returned only when the caller has no real
// (owner/editor/viewer) relationship — it grants full edit/view via reused screens.
export type MyAccess = 'owner' | 'editor' | 'viewer' | 'admin' | null;

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
