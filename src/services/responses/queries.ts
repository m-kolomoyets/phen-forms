import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getResponses, submitResponse } from './api';
import { responsesKeys } from './queryKeys';

export const submitResponseMutationOptions = () => {
    return mutationOptions({
        mutationKey: responsesKeys.submitMutationKey(),
        mutationFn: submitResponse,
    });
};

export const responsesQueryOptions = (questionnaireId: string) => {
    return queryOptions({
        queryKey: responsesKeys.listQueryKey(questionnaireId),
        queryFn() {
            return getResponses(questionnaireId);
        },
    });
};
