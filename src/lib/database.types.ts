export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.5';
    };
    public: {
        Tables: {
            answers: {
                Row: {
                    id: string;
                    question_id: string;
                    response_id: string;
                    value_number: number | null;
                    value_options: Json | null;
                    value_text: string | null;
                };
                Insert: {
                    id?: string;
                    question_id: string;
                    response_id: string;
                    value_number?: number | null;
                    value_options?: Json | null;
                    value_text?: string | null;
                };
                Update: {
                    id?: string;
                    question_id?: string;
                    response_id?: string;
                    value_number?: number | null;
                    value_options?: Json | null;
                    value_text?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'answers_question_id_fkey';
                        columns: ['question_id'];
                        isOneToOne: false;
                        referencedRelation: 'questions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'answers_response_id_fkey';
                        columns: ['response_id'];
                        isOneToOne: false;
                        referencedRelation: 'responses';
                        referencedColumns: ['id'];
                    },
                ];
            };
            question_options: {
                Row: {
                    id: string;
                    label: string;
                    position: number;
                    question_id: string;
                };
                Insert: {
                    id?: string;
                    label: string;
                    position: number;
                    question_id: string;
                };
                Update: {
                    id?: string;
                    label?: string;
                    position?: number;
                    question_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'question_options_question_id_fkey';
                        columns: ['question_id'];
                        isOneToOne: false;
                        referencedRelation: 'questions';
                        referencedColumns: ['id'];
                    },
                ];
            };
            questionnaires: {
                Row: {
                    accepting_responses: boolean;
                    created_at: string;
                    description: string | null;
                    ending_bg_url: string | null;
                    ending_description: string | null;
                    ending_title: string | null;
                    id: string;
                    owner_id: string;
                    published_at: string | null;
                    randomize_questions: boolean;
                    show_ending: boolean;
                    show_welcome: boolean;
                    status: Database['public']['Enums']['questionnaire_status'];
                    title: string;
                    updated_at: string;
                    welcome_bg_url: string | null;
                    welcome_description: string | null;
                    welcome_title: string | null;
                };
                Insert: {
                    accepting_responses?: boolean;
                    created_at?: string;
                    description?: string | null;
                    ending_bg_url?: string | null;
                    ending_description?: string | null;
                    ending_title?: string | null;
                    id?: string;
                    owner_id: string;
                    published_at?: string | null;
                    randomize_questions?: boolean;
                    show_ending?: boolean;
                    show_welcome?: boolean;
                    status?: Database['public']['Enums']['questionnaire_status'];
                    title: string;
                    updated_at?: string;
                    welcome_bg_url?: string | null;
                    welcome_description?: string | null;
                    welcome_title?: string | null;
                };
                Update: {
                    accepting_responses?: boolean;
                    created_at?: string;
                    description?: string | null;
                    ending_bg_url?: string | null;
                    ending_description?: string | null;
                    ending_title?: string | null;
                    id?: string;
                    owner_id?: string;
                    published_at?: string | null;
                    randomize_questions?: boolean;
                    show_ending?: boolean;
                    show_welcome?: boolean;
                    status?: Database['public']['Enums']['questionnaire_status'];
                    title?: string;
                    updated_at?: string;
                    welcome_bg_url?: string | null;
                    welcome_description?: string | null;
                    welcome_title?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'questionnaires_owner_id_fkey';
                        columns: ['owner_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
            questionnaire_shares: {
                Row: {
                    can_edit: boolean;
                    can_view_responses: boolean;
                    created_at: string;
                    questionnaire_id: string;
                    user_id: string;
                };
                Insert: {
                    can_edit?: boolean;
                    can_view_responses?: boolean;
                    created_at?: string;
                    questionnaire_id: string;
                    user_id: string;
                };
                Update: {
                    can_edit?: boolean;
                    can_view_responses?: boolean;
                    created_at?: string;
                    questionnaire_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'questionnaire_shares_questionnaire_id_fkey';
                        columns: ['questionnaire_id'];
                        isOneToOne: false;
                        referencedRelation: 'questionnaires';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'questionnaire_shares_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
            questions: {
                Row: {
                    config: Json;
                    created_at: string;
                    description: string | null;
                    id: string;
                    position: number;
                    prompt: string;
                    questionnaire_id: string;
                    required: boolean;
                    type: Database['public']['Enums']['question_type'];
                    updated_at: string;
                };
                Insert: {
                    config?: Json;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    position: number;
                    prompt: string;
                    questionnaire_id: string;
                    required?: boolean;
                    type: Database['public']['Enums']['question_type'];
                    updated_at?: string;
                };
                Update: {
                    config?: Json;
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    position?: number;
                    prompt?: string;
                    questionnaire_id?: string;
                    required?: boolean;
                    type?: Database['public']['Enums']['question_type'];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'questions_questionnaire_id_fkey';
                        columns: ['questionnaire_id'];
                        isOneToOne: false;
                        referencedRelation: 'questionnaires';
                        referencedColumns: ['id'];
                    },
                ];
            };
            responses: {
                Row: {
                    id: string;
                    meta: Json;
                    questionnaire_id: string;
                    submitted_at: string;
                };
                Insert: {
                    id?: string;
                    meta?: Json;
                    questionnaire_id: string;
                    submitted_at?: string;
                };
                Update: {
                    id?: string;
                    meta?: Json;
                    questionnaire_id?: string;
                    submitted_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'responses_questionnaire_id_fkey';
                        columns: ['questionnaire_id'];
                        isOneToOne: false;
                        referencedRelation: 'questionnaires';
                        referencedColumns: ['id'];
                    },
                ];
            };
            users: {
                Row: {
                    avatar_url: string | null;
                    created_at: string;
                    email: string;
                    first_name: string | null;
                    id: string;
                    last_name: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    created_at?: string;
                    email: string;
                    first_name?: string | null;
                    id: string;
                    last_name?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    created_at?: string;
                    email?: string;
                    first_name?: string | null;
                    id?: string;
                    last_name?: string | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            admin_list_users: {
                Args: Record<PropertyKey, never>;
                Returns: Json[];
            };
            admin_transfer_ownership: {
                Args: { p_new_owner: string; p_questionnaire_id: string };
                Returns: string;
            };
            am_i_admin: {
                Args: Record<PropertyKey, never>;
                Returns: boolean;
            };
            get_questionnaire_stats: {
                Args: { p_questionnaire_id: string };
                Returns: Json;
            };
            list_my_questionnaires: {
                Args: Record<PropertyKey, never>;
                Returns: Json[];
            };
            my_access: {
                Args: { p_questionnaire_id: string };
                Returns: string;
            };
            share_questionnaire: {
                Args: { p_email: string; p_questionnaire_id: string; p_role: string };
                Returns: string;
            };
            submit_response: {
                Args: { p_answers: Json; p_questionnaire_id: string };
                Returns: string;
            };
        };
        Enums: {
            question_type:
                | 'single_choice'
                | 'multiple_choice'
                | 'short_text'
                | 'long_text'
                | 'yes_no'
                | 'ranking'
                | 'opinion_scale';
            questionnaire_status: 'draft' | 'published' | 'closed';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            question_type: [
                'single_choice',
                'multiple_choice',
                'short_text',
                'long_text',
                'yes_no',
                'ranking',
                'opinion_scale',
            ],
            questionnaire_status: ['draft', 'published', 'closed'],
        },
    },
} as const;
