import type { ChartConfig } from '@/components/ui/Chart';
import type { QuestionStat } from '@/services/stats/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/Chart';

type StatChartProps = {
    stat: QuestionStat;
};

// Horizontal bar chart shared by choice / ranking / scale distributions.
function BarStat({ data, valueLabel }: { data: { label: string; value: number }[]; valueLabel: string }) {
    const config = { value: { label: valueLabel, color: 'var(--chart-1)' } } satisfies ChartConfig;

    return (
        <ChartContainer config={config} className="h-64 w-full">
            <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}

function TextAnswers({ answers }: { answers: string[] }) {
    if (answers.length === 0) {
        return <p className="text-sm text-muted-foreground">No answers yet.</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {answers.map((answer, index) => {
                return (
                    <li key={index} className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        {answer}
                    </li>
                );
            })}
        </ul>
    );
}

function StatChart({ stat }: StatChartProps) {
    switch (stat.type) {
        case 'single_choice':
            return (
                <BarStat
                    valueLabel="Responses"
                    data={stat.data.map((option) => {
                        return { label: option.label, value: option.count ?? 0 };
                    })}
                />
            );

        case 'multiple_choice':
            return (
                <div className="flex flex-col gap-4">
                    <BarStat
                        valueLabel="Responses"
                        data={stat.data.options.map((option) => {
                            return { label: option.label, value: option.count ?? 0 };
                        })}
                    />
                    {stat.data.other.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">Other answers</p>
                            <TextAnswers answers={stat.data.other} />
                        </div>
                    )}
                </div>
            );

        case 'ranking':
            return (
                <BarStat
                    valueLabel="Average rank"
                    data={stat.data.map((option) => {
                        return {
                            label: option.label,
                            value: option.avg_rank ?? 0,
                        };
                    })}
                />
            );

        case 'opinion_scale': {
            const distribution = Object.entries(stat.data.distribution)
                .map(([value, count]) => {
                    return { label: value, value: count, sort: Number(value) };
                })
                .sort((a, b) => {
                    return a.sort - b.sort;
                });

            return (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                        Average:{' '}
                        <span className="font-medium text-foreground">
                            {stat.data.average === null ? '—' : stat.data.average.toFixed(2)}
                        </span>
                    </p>
                    <BarStat valueLabel="Responses" data={distribution} />
                </div>
            );
        }

        case 'yes_no':
            return (
                <BarStat
                    valueLabel="Responses"
                    data={[
                        { label: 'Yes', value: stat.data.yes },
                        { label: 'No', value: stat.data.no },
                    ]}
                />
            );

        case 'short_text':
        case 'long_text':
            return <TextAnswers answers={stat.data} />;

        default:
            return null;
    }
}

export { StatChart };
