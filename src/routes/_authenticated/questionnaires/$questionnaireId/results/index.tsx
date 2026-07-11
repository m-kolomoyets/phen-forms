import { createFileRoute } from '@tanstack/react-router';
import { questionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { responsesQueryOptions } from '@/services/responses/queries';
import { questionnaireStatsQueryOptions } from '@/services/stats/queries';
import { Results } from '@/modules/Results';

export const Route = createFileRoute('/_authenticated/questionnaires/$questionnaireId/results/')({
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
