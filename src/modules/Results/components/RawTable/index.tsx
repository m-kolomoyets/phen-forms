import type { QuestionType, QuestionWithOptions } from '@/services/questions/types';
import type { Answer, ResponseWithAnswers } from '@/services/responses/types';
import { CheckIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatDateTime';
import { getScaleConfig } from '@/modules/FillIn/utils/config';
import { Badge } from '@/components/ui/Badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';

type RawTableProps = {
    questions: QuestionWithOptions[];
    responses: ResponseWithAnswers[];
};

const EMPTY = '—';

const optionIds = (value: Answer['value_options']): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((id): id is string => {
        return typeof id === 'string';
    });
};

// Cell content per question type. Choice → badges, opinion → progress bar,
// ranking → numbered chain; the rest stay plain text.
function AnswerCell({
    type,
    question,
    answer,
    labels,
}: {
    type: QuestionType;
    question: QuestionWithOptions;
    answer: Answer | undefined;
    labels: Map<string, string>;
}) {
    if (!answer) {
        return <span className="text-muted-foreground">{EMPTY}</span>;
    }

    switch (type) {
        case 'short_text':
        case 'long_text': {
            return answer.value_text ? (
                <span className="whitespace-pre-wrap">{answer.value_text}</span>
            ) : (
                <span className="text-muted-foreground">{EMPTY}</span>
            );
        }
        case 'yes_no': {
            if (answer.value_text !== 'yes' && answer.value_text !== 'no') {
                return <span className="text-muted-foreground">{EMPTY}</span>;
            }

            const isYes = answer.value_text === 'yes';

            return (
                <Badge variant={isYes ? 'default' : 'secondary'}>
                    {isYes ? <CheckIcon /> : <XIcon />}
                    {isYes ? 'Yes' : 'No'}
                </Badge>
            );
        }
        case 'single_choice': {
            const [id] = optionIds(answer.value_options);

            return id ? (
                <Badge variant="secondary">{labels.get(id) ?? EMPTY}</Badge>
            ) : (
                <span className="text-muted-foreground">{EMPTY}</span>
            );
        }
        case 'multiple_choice': {
            const ids = optionIds(answer.value_options);
            const other = answer.value_text?.trim();

            if (ids.length === 0 && !other) {
                return <span className="text-muted-foreground">{EMPTY}</span>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {ids.map((id) => {
                        return (
                            <Badge key={id} variant="secondary">
                                {labels.get(id) ?? EMPTY}
                            </Badge>
                        );
                    })}
                    {other ? <Badge variant="outline">{other}</Badge> : null}
                </div>
            );
        }
        case 'opinion_scale': {
            if (answer.value_number === null) {
                return <span className="text-muted-foreground">{EMPTY}</span>;
            }

            const { scale_min, scale_max } = getScaleConfig(question.config);
            const span = scale_max - scale_min;
            const percent = span > 0 ? Math.min(100, Math.max(0, ((answer.value_number - scale_min) / span) * 100)) : 0;

            return (
                <div className="flex min-w-32 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {answer.value_number}/{scale_max}
                    </span>
                </div>
            );
        }
        case 'ranking': {
            const ids = optionIds(answer.value_options);

            if (ids.length === 0) {
                return <span className="text-muted-foreground">{EMPTY}</span>;
            }

            return (
                <ol className="flex flex-wrap items-center gap-1">
                    {ids.map((id, index) => {
                        return (
                            <li key={id} className="flex items-center gap-1">
                                {index > 0 ? <ChevronRightIcon className="size-3.5 text-muted-foreground/60" /> : null}
                                <span className="inline-flex items-center gap-1.5 rounded-full border bg-card py-0.5 pr-2.5 pl-1">
                                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm">{labels.get(id) ?? EMPTY}</span>
                                </span>
                            </li>
                        );
                    })}
                </ol>
            );
        }
    }
}

function RawTable({ questions, responses }: RawTableProps) {
    const labels = new Map<string, string>();

    for (const question of questions) {
        for (const option of question.question_options) {
            labels.set(option.id, option.label);
        }
    }

    if (responses.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>No responses yet</EmptyTitle>
                    <EmptyDescription>Responses appear here once people submit the questionnaire.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left">
                        <th className="whitespace-nowrap p-3 font-medium">Submitted at</th>
                        {questions.map((question) => {
                            return (
                                <th key={question.id} className="whitespace-nowrap p-3 font-medium">
                                    {question.prompt}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {responses.map((response) => {
                        const byQuestion = new Map<string, Answer>();

                        for (const answer of response.answers) {
                            byQuestion.set(answer.question_id, answer);
                        }

                        return (
                            <tr key={response.id} className="border-b align-top last:border-0 hover:bg-muted/30">
                                <td className="whitespace-nowrap p-3 text-muted-foreground tabular-nums">
                                    {formatDateTime(response.submitted_at)}
                                </td>
                                {questions.map((question) => {
                                    return (
                                        <td key={question.id} className="p-3">
                                            <AnswerCell
                                                type={question.type}
                                                question={question}
                                                answer={byQuestion.get(question.id)}
                                                labels={labels}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export { RawTable };
