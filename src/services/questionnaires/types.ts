import type { Database } from '@/lib/database.types';

export type Questionnaire = Database['public']['Tables']['questionnaires']['Row'];

export type QuestionnaireStatus = Database['public']['Enums']['questionnaire_status'];

export type CreateQuestionnairePayload = Pick<
    Database['public']['Tables']['questionnaires']['Insert'],
    'title' | 'description'
>;

export type UpdateQuestionnairePayload = {
    id: string;
} & Pick<Database['public']['Tables']['questionnaires']['Update'], 'title' | 'description'>;
