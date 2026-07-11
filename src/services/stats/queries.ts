import { queryOptions } from '@tanstack/react-query';
import { getQuestionnaireStats } from './api';
import { statsKeys } from './queryKeys';

export const questionnaireStatsQueryOptions = (questionnaireId: string) => {
    return queryOptions({
        queryKey: statsKeys.questionnaireStatsQueryKey(questionnaireId),
        queryFn() {
            return getQuestionnaireStats(questionnaireId);
        },
    });
};
