import type { QuestionOption } from '@/services/questions/types';
import type { AnswerDraft, AnswerDrafts, FillInProps } from './types';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { submitResponseMutationOptions } from '@/services/responses/queries';
import { Button } from '@/components/ui/Button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';
import { initDraft, toSubmitAnswer, validateDraft } from './utils/answers';
import { getChoiceConfig } from './utils/config';
import { shuffle } from './utils/shuffle';
import { QuestionField } from './components/QuestionField';
import { ThankYouScreen } from './components/ThankYouScreen';
import { WelcomeScreen } from './components/WelcomeScreen';

type Phase = 'welcome' | 'questions' | 'done';

function FillIn({ questionnaire, questions }: FillInProps) {
    // Render-time order + option shuffling, computed once so navigation between
    // steps never reshuffles. Canonical order is untouched in storage.
    const [orderedQuestions] = useState(() => {
        return questionnaire.randomize_questions ? shuffle(questions) : questions;
    });

    const [displayOptions] = useState(() => {
        const map = new Map<string, QuestionOption[]>();

        for (const question of questions) {
            const shouldShuffle = getChoiceConfig(question.config).shuffle_options;
            map.set(question.id, shouldShuffle ? shuffle(question.question_options) : question.question_options);
        }

        return map;
    });

    const [drafts, setDrafts] = useState<AnswerDrafts>(() => {
        const initial: AnswerDrafts = {};

        for (const question of questions) {
            initial[question.id] = initDraft(question);
        }

        return initial;
    });

    const [phase, setPhase] = useState<Phase>(questionnaire.show_welcome ? 'welcome' : 'questions');
    const [index, setIndex] = useState(0);
    const [error, setError] = useState<string | undefined>(undefined);

    const { mutateAsync: submit, isPending } = useMutation(submitResponseMutationOptions());

    if (!questionnaire.accepting_responses) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>Not accepting responses</EmptyTitle>
                    <EmptyDescription>This questionnaire is not currently accepting responses.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (orderedQuestions.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>Nothing to answer</EmptyTitle>
                    <EmptyDescription>This questionnaire has no questions yet.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (phase === 'welcome') {
        return (
            <WelcomeScreen
                questionnaire={questionnaire}
                onStart={() => {
                    setPhase('questions');
                }}
            />
        );
    }

    if (phase === 'done') {
        return <ThankYouScreen questionnaire={questionnaire} />;
    }

    const current = orderedQuestions[index];
    const isLast = index === orderedQuestions.length - 1;

    const handleChange = (draft: AnswerDraft) => {
        setError(undefined);
        setDrafts((previous) => {
            return { ...previous, [current.id]: draft };
        });
    };

    const handleBack = () => {
        setError(undefined);
        setIndex((previous) => {
            return Math.max(0, previous - 1);
        });
    };

    const handleSubmit = async () => {
        const answers = orderedQuestions
            .map((question) => {
                return toSubmitAnswer(question.id, drafts[question.id]);
            })
            .filter((answer) => {
                return answer !== null;
            });

        try {
            await submit({ questionnaireId: questionnaire.id, answers });
            setPhase('done');
        } catch (submitError) {
            toast.error(submitError instanceof Error ? submitError.message : 'Could not submit your response');
        }
    };

    const handleNext = () => {
        const validationError = validateDraft(current, drafts[current.id]);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (isLast) {
            void handleSubmit();
            return;
        }

        setIndex((previous) => {
            return previous + 1;
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="text-muted-foreground flex justify-between text-sm">
                    <span>{questionnaire.title}</span>
                    <span>
                        {index + 1} / {orderedQuestions.length}
                    </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${((index + 1) / orderedQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex-1">
                <QuestionField
                    key={current.id}
                    question={current}
                    options={displayOptions.get(current.id) ?? current.question_options}
                    draft={drafts[current.id]}
                    error={error}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-between gap-3">
                <Button variant="outline" disabled={index === 0} onClick={handleBack}>
                    <ArrowLeftIcon />
                    Back
                </Button>
                <Button disabled={isPending} onClick={handleNext}>
                    {isLast ? (
                        <>
                            <SendIcon />
                            Submit
                        </>
                    ) : (
                        <>
                            Next
                            <ArrowRightIcon />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export { FillIn };
