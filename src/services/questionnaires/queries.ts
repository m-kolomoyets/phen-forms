import type { Filters } from '@/lib/types';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
    createQuestionnaire,
    deleteQuestionnaire,
    getQuestionnaire,
    getQuestionnaires,
    updateQuestionnaire,
} from './api';
import { questionnairesKeys } from './queryKeys';

export const questionnairesQueryOptions = (filters: Filters = {}) => {
    return queryOptions({
        queryKey: questionnairesKeys.questionnairesQueryKey(filters),
        queryFn: getQuestionnaires,
    });
};

export const questionnaireQueryOptions = (id: string) => {
    return queryOptions({
        queryKey: questionnairesKeys.questionnaireQueryKey(id),
        queryFn() {
            return getQuestionnaire(id);
        },
    });
};

export const createQuestionnaireMutationOptions = () => {
    return mutationOptions({
        mutationKey: questionnairesKeys.createMutationKey(),
        mutationFn: createQuestionnaire,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionnairesKeys.all() });
        },
    });
};

export const updateQuestionnaireMutationOptions = () => {
    return mutationOptions({
        mutationKey: questionnairesKeys.updateMutationKey(),
        mutationFn: updateQuestionnaire,
        onSuccess(data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionnairesKeys.all() });
            client.setQueryData(questionnairesKeys.questionnaireQueryKey(data.id), data);
        },
    });
};

export const deleteQuestionnaireMutationOptions = () => {
    return mutationOptions({
        mutationKey: questionnairesKeys.deleteMutationKey(),
        mutationFn: deleteQuestionnaire,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.invalidateQueries({ queryKey: questionnairesKeys.all() });
        },
    });
};
