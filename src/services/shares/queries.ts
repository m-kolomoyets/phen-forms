import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { questionnairesKeys } from '@/services/questionnaires/queryKeys';
import { getCollaborators, getMyAccess, shareQuestionnaire } from './api';
import { sharesKeys } from './queryKeys';

export const collaboratorsQueryOptions = (questionnaireId: string) => {
    return queryOptions({
        queryKey: sharesKeys.collaboratorsQueryKey(questionnaireId),
        queryFn() {
            return getCollaborators(questionnaireId);
        },
    });
};

export const myAccessQueryOptions = (questionnaireId: string) => {
    return queryOptions({
        queryKey: sharesKeys.myAccessQueryKey(questionnaireId),
        queryFn() {
            return getMyAccess(questionnaireId);
        },
    });
};

export const shareQuestionnaireMutationOptions = () => {
    return mutationOptions({
        mutationKey: sharesKeys.shareMutationKey(),
        mutationFn: shareQuestionnaire,
        onSuccess(status, variables, _onMutateResult, { client }) {
            if (status === 'shared') {
                client.invalidateQueries({ queryKey: questionnairesKeys.all() });
                client.invalidateQueries({
                    queryKey: sharesKeys.collaboratorsQueryKey(variables.questionnaireId),
                });
            }
        },
    });
};
