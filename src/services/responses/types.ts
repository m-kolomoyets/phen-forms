import type { Database } from '@/lib/database.types';

export type Response = Database['public']['Tables']['responses']['Row'];

export type Answer = Database['public']['Tables']['answers']['Row'];

// One submission plus its answers. Owner-only via RLS; feeds the raw table + export.
export type ResponseWithAnswers = Pick<Response, 'id' | 'submitted_at'> & {
    answers: Answer[];
};

// One entry of the submit_response RPC payload. Mirrors the columns the RPC
// reads per question; the fill-in UI maps validated answer values into these.
export type SubmitAnswer = {
    question_id: string;
    value_text?: string | null;
    value_number?: number | null;
    value_options?: string[] | null;
};

export type SubmitResponsePayload = {
    questionnaireId: string;
    answers: SubmitAnswer[];
};
