import type {
    CreateQuestionPayload,
    QuestionWithOptions,
    ReorderQuestionsPayload,
    UpdateQuestionPayload,
} from './types';
import { supabase } from '@/lib/@supabase';

const QUESTION_WITH_OPTIONS = '*, question_options(*)';

const sortOptions = (question: QuestionWithOptions) => {
    return {
        ...question,
        question_options: [...question.question_options].sort((a, b) => {
            return a.position - b.position;
        }),
    };
};

export const getQuestions = async (questionnaireId: string) => {
    const { data, error } = await supabase
        .from('questions')
        .select(QUESTION_WITH_OPTIONS)
        .eq('questionnaire_id', questionnaireId)
        .order('position', { ascending: true });

    if (error) {
        throw error;
    }

    return data.map(sortOptions);
};

const insertOptions = async (questionId: string, options: CreateQuestionPayload['options']) => {
    if (options.length === 0) {
        return;
    }

    const { error } = await supabase.from('question_options').insert(
        options.map((option, index) => {
            return { question_id: questionId, label: option.label, position: index };
        })
    );

    if (error) {
        throw error;
    }
};

// Postgres unique_violation — the read-then-insert position pick is not atomic,
// so two overlapping creates (e.g. rapid duplicate clicks) can target the same
// unique(questionnaire_id, position) slot. Retry re-reads the max and tries again.
const UNIQUE_VIOLATION = '23505';

export const createQuestion = async ({ options, ...payload }: CreateQuestionPayload) => {
    const insertQuestion = async () => {
        const { data: last, error: positionError } = await supabase
            .from('questions')
            .select('position')
            .eq('questionnaire_id', payload.questionnaire_id)
            .order('position', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (positionError) {
            throw positionError;
        }

        const position = last ? last.position + 1 : 0;

        return supabase
            .from('questions')
            .insert({ ...payload, position })
            .select('id')
            .single();
    };

    let attempt = await insertQuestion();

    for (let retries = 0; attempt.error?.code === UNIQUE_VIOLATION && retries < 5; retries++) {
        attempt = await insertQuestion();
    }

    if (attempt.error) {
        throw attempt.error;
    }

    await insertOptions(attempt.data.id, options);

    return attempt.data.id;
};

export const updateQuestion = async ({ id, options, ...payload }: UpdateQuestionPayload) => {
    const { error } = await supabase.from('questions').update(payload).eq('id', id);

    if (error) {
        throw error;
    }

    // Pre-lock only (structure locks once responses exist): replace the option set
    // wholesale — simplest correct reconciliation, positions reused after delete.
    const { error: deleteError } = await supabase.from('question_options').delete().eq('question_id', id);

    if (deleteError) {
        throw deleteError;
    }

    await insertOptions(id, options);

    return id;
};

export const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('questions').delete().eq('id', id);

    if (error) {
        throw error;
    }

    return id;
};

export const reorderQuestions = async ({ questionnaireId, orderedIds }: ReorderQuestionsPayload) => {
    // Two-phase to dodge the unique(questionnaire_id, position) constraint: park
    // every row at a unique negative slot, then assign its final position. Each
    // UPDATE targets a distinct position, so no transient collision ever occurs.
    for (let index = 0; index < orderedIds.length; index++) {
        const { error } = await supabase
            .from('questions')
            .update({ position: -(index + 1) })
            .eq('id', orderedIds[index]);

        if (error) {
            throw error;
        }
    }

    for (let index = 0; index < orderedIds.length; index++) {
        const { error } = await supabase.from('questions').update({ position: index }).eq('id', orderedIds[index]);

        if (error) {
            throw error;
        }
    }

    return questionnaireId;
};
