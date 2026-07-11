export const sharesKeys = {
    all() {
        return ['shares'] as const;
    },
    collaboratorsQueryKey(questionnaireId: string) {
        return [...sharesKeys.all(), 'collaborators', questionnaireId] as const;
    },
    myAccessQueryKey(questionnaireId: string) {
        return [...sharesKeys.all(), 'my-access', questionnaireId] as const;
    },
    shareMutationKey() {
        return [...sharesKeys.all(), 'share'] as const;
    },
    updateRoleMutationKey() {
        return [...sharesKeys.all(), 'update-role'] as const;
    },
    removeMutationKey() {
        return [...sharesKeys.all(), 'remove'] as const;
    },
};
