export const questionsKeys = {
    all() {
        return ['questions'] as const;
    },
    listByQuestionnaire(questionnaireId: string) {
        return [...questionsKeys.all(), 'list', questionnaireId] as const;
    },
    createMutationKey() {
        return [...questionsKeys.all(), 'create'] as const;
    },
    updateMutationKey() {
        return [...questionsKeys.all(), 'update'] as const;
    },
    deleteMutationKey() {
        return [...questionsKeys.all(), 'delete'] as const;
    },
    reorderMutationKey() {
        return [...questionsKeys.all(), 'reorder'] as const;
    },
};
