export const authKeys = {
    all() {
        return ['auth'] as const;
    },
    meQueryKey() {
        return [...authKeys.all(), 'me'] as const;
    },
    // NOTE: We can also assign mutation keys if needed.
    // It's important to have mutation keys for comprehensive optimistic updates https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query
    loginMutationKey() {
        return [...authKeys.all(), 'login'] as const;
    },
};
