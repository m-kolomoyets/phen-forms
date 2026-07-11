import type { Database } from '@/lib/database.types';

export type Questionnaire = Database['public']['Tables']['questionnaires']['Row'];

// 'owner' for questionnaires I own; 'editor'/'viewer' derived from my share row.
export type QuestionnaireRole = 'owner' | 'editor' | 'viewer';

export type QuestionnaireOwner = Pick<
    Database['public']['Tables']['users']['Row'],
    'id' | 'email' | 'first_name' | 'last_name' | 'avatar_url'
>;

export type QuestionnaireListItem = Questionnaire & {
    questionsCount: number;
    responsesCount: number;
    owner: QuestionnaireOwner | null;
    role: QuestionnaireRole;
    sharesCount: number;
};

export type QuestionnaireStatus = Database['public']['Enums']['questionnaire_status'];

export type CreateQuestionnairePayload = Pick<
    Database['public']['Tables']['questionnaires']['Insert'],
    'title' | 'description'
>;

export type UpdateQuestionnairePayload = {
    id: string;
} & Partial<
    Pick<
        Database['public']['Tables']['questionnaires']['Update'],
        | 'title'
        | 'description'
        | 'status'
        | 'accepting_responses'
        | 'randomize_questions'
        | 'show_welcome'
        | 'welcome_title'
        | 'welcome_description'
        | 'welcome_bg_url'
        | 'show_ending'
        | 'ending_title'
        | 'ending_description'
        | 'ending_bg_url'
        | 'published_at'
    >
>;
