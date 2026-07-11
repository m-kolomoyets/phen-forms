import { createFileRoute, redirect } from '@tanstack/react-router';
import { questionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { myAccessQueryOptions } from '@/services/shares/queries';
import { QuestionnaireBuilder } from '@/modules/QuestionnaireBuilder';

export const Route = createFileRoute('/_authenticated/questionnaires/$questionnaireId/')({
    // Guard the constructor: owner/editor may edit; viewer is bounced to
    // results; no access falls back to the list.
    async beforeLoad({ context: { queryClient }, params: { questionnaireId } }) {
        const access = await queryClient.ensureQueryData(myAccessQueryOptions(questionnaireId));

        if (access === 'viewer') {
            throw redirect({ to: '/questionnaires/$questionnaireId/results', params: { questionnaireId } });
        }

        if (!access) {
            throw redirect({ to: '/questionnaires' });
        }
    },
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
