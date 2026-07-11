import { createFileRoute } from '@tanstack/react-router';
import { questionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { QuestionnaireBuilder } from '@/modules/QuestionnaireBuilder';

export const Route = createFileRoute('/_authenticated/questionnaires/$questionnaireId/')({
    async loader({ context: { queryClient }, params: { questionnaireId } }) {
        await Promise.all([
            queryClient.ensureQueryData(questionnaireQueryOptions(questionnaireId)),
            queryClient.ensureQueryData(questionsQueryOptions(questionnaireId)),
        ]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { questionnaireId } = Route.useParams();

    return <QuestionnaireBuilder questionnaireId={questionnaireId} />;
}
