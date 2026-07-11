import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { publicQuestionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { FillIn } from '@/modules/FillIn';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';

export const Route = createFileRoute('/_public/q/$questionnaireId/')({
    async loader({ context: { queryClient }, params: { questionnaireId } }) {
        await Promise.all([
            queryClient.ensureQueryData(publicQuestionnaireQueryOptions(questionnaireId)),
            queryClient.ensureQueryData(questionsQueryOptions(questionnaireId)),
        ]);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { questionnaireId } = Route.useParams();
    const { data: questionnaire } = useSuspenseQuery(publicQuestionnaireQueryOptions(questionnaireId));
    const { data: questions } = useSuspenseQuery(questionsQueryOptions(questionnaireId));

    return (
        <div className="flex min-h-svh flex-col p-6">
            {questionnaire ? (
                <FillIn questionnaire={questionnaire} questions={questions} />
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>Questionnaire unavailable</EmptyTitle>
                        <EmptyDescription>
                            This questionnaire does not exist, or it is not open for responses.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </div>
    );
}
