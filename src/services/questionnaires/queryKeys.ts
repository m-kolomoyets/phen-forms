import type { Filters } from '@/lib/types';

export const questionnairesKeys = {
    all() {
        return ['questionnaires'] as const;
    },
    questionnairesQueryKey(filters: Filters = {}) {
        return [...questionnairesKeys.all(), 'list', filters] as const;
    },
    questionnaireQueryKey(id: string) {
        return [...questionnairesKeys.all(), 'detail', id] as const;
    },
    createMutationKey() {
        return [...questionnairesKeys.all(), 'create'] as const;
    },
    updateMutationKey() {
        return [...questionnairesKeys.all(), 'update'] as const;
    },
    deleteMutationKey() {
        return [...questionnairesKeys.all(), 'delete'] as const;
    },
};
