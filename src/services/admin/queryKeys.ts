export const adminKeys = {
    all() {
        return ['admin'] as const;
    },
    amIAdminQueryKey() {
        return [...adminKeys.all(), 'am-i-admin'] as const;
    },
    usersQueryKey() {
        return [...adminKeys.all(), 'users'] as const;
    },
    questionnairesQueryKey() {
        return [...adminKeys.all(), 'questionnaires'] as const;
    },
    transferOwnershipMutationKey() {
        return [...adminKeys.all(), 'transfer-ownership'] as const;
    },
};
