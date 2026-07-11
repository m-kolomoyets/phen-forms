import { createFileRoute, redirect } from '@tanstack/react-router';
import { questionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { responsesQueryOptions } from '@/services/responses/queries';
import { myAccessQueryOptions } from '@/services/shares/queries';
import { questionnaireStatsQueryOptions } from '@/services/stats/queries';
import { Results } from '@/modules/Results';

export const Route = createFileRoute('/_authenticated/questionnaires/$questionnaireId/results/')({
    // Guard results: owner/editor/viewer may view; no access falls back to the list.
    async beforeLoad({ context: { queryClient }, params: { questionnaireId } }) {
        const access = await queryClient.ensureQueryData(myAccessQueryOptions(questionnaireId));

        if (!access) {
            throw redirect({ to: '/questionnaires' });
        }
    },
    async loader({ context: { queryClient }, params: { questionnaireId } }) {
        await Promise.all([
            queryClient.ensureQueryData(questionnaireQueryOptions(questionnaireId)),
            queryClient.ensureQueryData(questionnaireStatsQueryOptions(questionnaireId)),
            queryClient.ensureQueryData(questionsQueryOptions(questionnaireId)),
            queryClient.ensureQueryData(responsesQueryOptions(questionnaireId)),
        ]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { questionnaireId } = Route.useParams();

    return <Results questionnaireId={questionnaireId} />;
}
