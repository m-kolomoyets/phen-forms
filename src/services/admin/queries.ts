import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getAdminUsers, getAllQuestionnaires, getAmIAdmin, transferOwnership } from './api';
import { adminKeys } from './queryKeys';

export const amIAdminQueryOptions = () => {
    return queryOptions({
        queryKey: adminKeys.amIAdminQueryKey(),
        queryFn() {
            return getAmIAdmin();
        },
    });
};

export const adminUsersQueryOptions = () => {
    return queryOptions({
        queryKey: adminKeys.usersQueryKey(),
        queryFn: getAdminUsers,
    });
};

export const adminQuestionnairesQueryOptions = () => {
    return queryOptions({
        queryKey: adminKeys.questionnairesQueryKey(),
        queryFn: getAllQuestionnaires,
    });
};

export const transferOwnershipMutationOptions = () => {
    return mutationOptions({
        mutationKey: adminKeys.transferOwnershipMutationKey(),
        mutationFn: transferOwnership,
        onSuccess(status, _variables, _onMutateResult, { client }) {
            if (status === 'transferred') {
                client.invalidateQueries({ queryKey: adminKeys.questionnairesQueryKey() });
            }
        },
    });
};
