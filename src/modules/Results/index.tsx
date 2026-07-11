import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, BarChart3Icon, DownloadIcon, TableIcon } from 'lucide-react';
import { QUESTION_TYPE_LABEL } from '@/lib/questions/constants';
import { questionnaireQueryOptions } from '@/services/questionnaires/queries';
import { questionsQueryOptions } from '@/services/questions/queries';
import { responsesQueryOptions } from '@/services/responses/queries';
import { questionnaireStatsQueryOptions } from '@/services/stats/queries';
import { MainLayoutHeader } from '@/components/layouts/MainLayoutHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { downloadCsv, downloadXlsx } from './utils/download';
import { buildExportTable } from './utils/export';
import { RawTable } from './components/RawTable';
import { StatChart } from './components/StatChart';

type ResultsProps = {
    questionnaireId: string;
};

const slugify = (value: string) => {
    return (
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'responses'
    );
};

function Results({ questionnaireId }: ResultsProps) {
    const { data: questionnaire } = useSuspenseQuery(questionnaireQueryOptions(questionnaireId));
    const { data: stats } = useSuspenseQuery(questionnaireStatsQueryOptions(questionnaireId));
    const { data: questions } = useSuspenseQuery(questionsQueryOptions(questionnaireId));
    const { data: responses } = useSuspenseQuery(responsesQueryOptions(questionnaireId));

    const hasQuestions = stats.length > 0;
    const hasResponses = responses.length > 0;

    const handleCsv = () => {
        downloadCsv(buildExportTable(questions, responses), `${slugify(questionnaire.title)}.csv`);
    };

    const handleXlsx = () => {
        downloadXlsx(buildExportTable(questions, responses), `${slugify(questionnaire.title)}.xlsx`);
    };

    return (
        <>
            <MainLayoutHeader className="justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Back to questionnaires"
                        render={<Link to="/questionnaires" />}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <h1 className="truncate text-lg font-semibold">{questionnaire.title}</h1>
                </div>

                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={handleCsv} disabled={!hasResponses}>
                        <DownloadIcon />
                        CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleXlsx} disabled={!hasResponses}>
                        <DownloadIcon />
                        XLSX
                    </Button>
                </div>
            </MainLayoutHeader>

            {hasQuestions ? (
                <Tabs defaultValue="charts" className="gap-4">
                    <TabsList>
                        <TabsTrigger value="charts">
                            <BarChart3Icon />
                            Charts
                        </TabsTrigger>
                        <TabsTrigger value="table">
                            <TableIcon />
                            Table
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="charts" className="flex flex-col gap-4">
                        {stats.map((stat) => {
                            return (
                                <section key={stat.question_id} className="flex flex-col gap-4 rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="font-medium">{stat.prompt}</h2>
                                            <Badge variant="secondary">{QUESTION_TYPE_LABEL[stat.type]}</Badge>
                                        </div>
                                        <span className="shrink-0 text-sm text-muted-foreground">
                                            {stat.response_count} responses
                                        </span>
                                    </div>
                                    <StatChart stat={stat} />
                                </section>
                            );
                        })}
                    </TabsContent>

                    <TabsContent value="table">
                        <RawTable questions={questions} responses={responses} />
                    </TabsContent>
                </Tabs>
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No questions</EmptyTitle>
                        <EmptyDescription>Add questions to this questionnaire to collect results.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </>
    );
}

export { Results };
