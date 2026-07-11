import { createFileRoute } from '@tanstack/react-router';
import { questionnairesQueryOptions } from '@/services/questionnaires/queries';
import { Questionnaires } from '@/modules/Questionnaires';

export const Route = createFileRoute('/_authenticated/questionnaires/')({
    loader({ context: { queryClient } }) {
        return queryClient.ensureQueryData(questionnairesQueryOptions());
    },
    component: Questionnaires,
});
