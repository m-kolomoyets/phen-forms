export const responsesKeys = {
    all() {
        return ['responses'] as const;
    },
    submitMutationKey() {
        return [...responsesKeys.all(), 'submit'] as const;
    },
    listQueryKey(questionnaireId: string) {
        return [...responsesKeys.all(), 'list', questionnaireId] as const;
    },
};
