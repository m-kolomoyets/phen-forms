import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createQuestion, deleteQuestion, getQuestions, reorderQuestions, updateQuestion } from './api';
import { questionsKeys } from './queryKeys';

export const questionsQueryOptions = (questionnaireId: string) => {
    return queryOptions({
        queryKey: questionsKeys.listByQuestionnaire(questionnaireId),
        queryFn() {
            return getQuestions(questionnaireId);
        },
    });
};

export const createQuestionMutationOptions = (questionnaireId: string) => {
    return mutationOptions({
        mutationKey: questionsKeys.createMutationKey(),
        mutationFn: createQuestion,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionsKeys.listByQuestionnaire(questionnaireId) });
        },
    });
};

export const updateQuestionMutationOptions = (questionnaireId: string) => {
    return mutationOptions({
        mutationKey: questionsKeys.updateMutationKey(),
        mutationFn: updateQuestion,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionsKeys.listByQuestionnaire(questionnaireId) });
        },
    });
};

export const deleteQuestionMutationOptions = (questionnaireId: string) => {
    return mutationOptions({
        mutationKey: questionsKeys.deleteMutationKey(),
        mutationFn: deleteQuestion,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionsKeys.listByQuestionnaire(questionnaireId) });
        },
    });
};

export const reorderQuestionsMutationOptions = () => {
    return mutationOptions({
        mutationKey: questionsKeys.reorderMutationKey(),
        mutationFn: reorderQuestions,
        onSuccess(questionnaireId, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionsKeys.listByQuestionnaire(questionnaireId) });
        },
    });
};
