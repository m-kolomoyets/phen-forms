import { createFileRoute } from '@tanstack/react-router';
import { adminQuestionnairesQueryOptions } from '@/services/admin/queries';
import { AdminQuestionnaires } from '@/modules/Admin';

export const Route = createFileRoute('/_authenticated/admin/questionnaires/')({
    async loader({ context: { queryClient } }) {
        await queryClient.ensureQueryData(adminQuestionnairesQueryOptions());
    },
    component: AdminQuestionnaires,
});
