import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { router } from '@/lib/@router';
import { ONE_MINUTE } from '@/lib/constants';
import { login, logout, me } from './api';
import { authKeys } from './queryKeys';

export const meQueryOptions = () => {
    return queryOptions({
        queryKey: authKeys.meQueryKey(),
        queryFn: me,
        staleTime: ONE_MINUTE,
    });
};

export const loginMutationOptions = () => {
    return mutationOptions({
        mutationKey: authKeys.loginMutationKey(),
        mutationFn: login,
    });
};

export const logoutMutationOptions = () => {
    return mutationOptions({
        mutationFn: logout,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            client.clear();
            router.invalidate();
        },
    });
};
