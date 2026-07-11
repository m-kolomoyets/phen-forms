export const statsKeys = {
    all() {
        return ['stats'] as const;
    },
    questionnaireStatsQueryKey(questionnaireId: string) {
        return [...statsKeys.all(), 'questionnaire', questionnaireId] as const;
    },
};
