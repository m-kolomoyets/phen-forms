import type { QuestionType } from '@/lib/questions/constants';
import type { QuestionWithOptions } from '@/services/questions/types';
import { useState } from 'react';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
    ArrowLeftIcon,
    CheckIcon,
    LoaderCircleIcon,
    MoreVerticalIcon,
    PencilIcon,
    SendIcon,
    SettingsIcon,
    UndoIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { questionnaireQueryOptions, updateQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import {
    createQuestionMutationOptions,
    deleteQuestionMutationOptions,
    questionsQueryOptions,
    reorderQuestionsMutationOptions,
} from '@/services/questions/queries';
import { questionsKeys } from '@/services/questions/queryKeys';
import { buildQuestionConfig, getDefaultQuestionFormState } from '@/modules/QuestionnaireBuilder/constants';
import { MainLayoutHeader } from '@/components/layouts/MainLayoutHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';
import { QUESTIONNAIRE_STATUS_BADGE } from '../Questionnaires/constants';
import { AddQuestionDialog } from './components/AddQuestionDialog';
import { EditDetailsDialog } from './components/EditDetailsDialog';
import { QuestionEditor } from './components/QuestionEditor';
import { QuestionList } from './components/QuestionList';
import { QuestionnaireSettingsSheet } from './components/QuestionnaireSettingsSheet';

type QuestionnaireBuilderProps = {
    questionnaireId: string;
};

function QuestionnaireBuilder({ questionnaireId }: QuestionnaireBuilderProps) {
    const { data: questionnaire } = useSuspenseQuery(questionnaireQueryOptions(questionnaireId));
    const { data: questions } = useSuspenseQuery(questionsQueryOptions(questionnaireId));

    const [selectedId, setSelectedId] = useState<string | undefined>(questions[0]?.id);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { mutateAsync: createQuestion } = useMutation(createQuestionMutationOptions(questionnaireId));
    const { mutateAsync: reorderQuestions, isPending: isReordering } = useMutation(reorderQuestionsMutationOptions());
    const { mutateAsync: deleteQuestion } = useMutation(deleteQuestionMutationOptions(questionnaireId));
    const { mutate: updateQuestionnaire } = useMutation(updateQuestionnaireMutationOptions());

    // Any in-flight question mutation (edit, add, delete, reorder) marks the builder as saving.
    const isSaving = useIsMutating({ mutationKey: questionsKeys.all() }) > 0;

    // Derive effective selection so a freshly-created id survives the brief
    // window before its refetch lands, and a deleted id falls back to the first
    // question — without a render-phase setState that would clobber the pick.
    const selectedQuestion = questions.find((question) => {
        return question.id === selectedId;
    });
    const effectiveQuestion = selectedQuestion ?? questions[0];

    const status = QUESTIONNAIRE_STATUS_BADGE[questionnaire.status];

    const handleLifecycle = (patch: Parameters<typeof updateQuestionnaire>[0], message: string) => {
        updateQuestionnaire(patch, {
            onSuccess() {
                toast.success(message);
            },
            onError(error) {
                toast.error(error instanceof Error ? error.message : 'Could not update questionnaire');
            },
        });
    };

    const publish = () => {
        handleLifecycle(
            {
                id: questionnaireId,
                status: 'published',
                accepting_responses: true,
                published_at: questionnaire.published_at ?? new Date().toISOString(),
            },
            'Questionnaire published'
        );
    };

    const unpublish = () => {
        handleLifecycle(
            { id: questionnaireId, status: 'draft', accepting_responses: false },
            'Questionnaire unpublished'
        );
    };

    const setAccepting = (accepting: boolean) => {
        handleLifecycle(
            { id: questionnaireId, accepting_responses: accepting },
            accepting ? 'Accepting responses' : 'Responses paused'
        );
    };

    const close = () => {
        handleLifecycle({ id: questionnaireId, status: 'closed', accepting_responses: false }, 'Questionnaire closed');
    };

    const handleAdd = async (type: QuestionType) => {
        const state = getDefaultQuestionFormState(type);

        try {
            const id = await createQuestion({
                questionnaire_id: questionnaireId,
                type,
                prompt: 'Untitled question',
                description: null,
                required: false,
                config: buildQuestionConfig(state),
                options: state.options.map((option) => {
                    return { label: option.label };
                }),
            });
            setSelectedId(id);
            toast.success('Question added');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not add question');
        }
    };

    const handleReorder = async (orderedIds: string[]) => {
        try {
            await reorderQuestions({ questionnaireId, orderedIds });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not reorder questions');
        }
    };

    const handleDuplicate = async (question: QuestionWithOptions) => {
        try {
            const id = await createQuestion({
                questionnaire_id: questionnaireId,
                type: question.type,
                prompt: question.prompt,
                description: question.description,
                required: question.required,
                config: question.config,
                options: question.question_options.map((option) => {
                    return { label: option.label };
                }),
            });
            setSelectedId(id);
            toast.success('Question duplicated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not duplicate question');
        }
    };

    const handleDelete = async (question: QuestionWithOptions) => {
        try {
            await deleteQuestion(question.id);
            toast.success('Question deleted');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not delete question');
        }
    };

    return (
        <>
            <MainLayoutHeader className="justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Back to questionnaires"
                        render={<Link to="/questionnaires" />}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <button
                        type="button"
                        title="Edit name and description"
                        aria-label="Edit name and description"
                        className="group flex items-center gap-1.5 overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        onClick={() => {
                            setIsDetailsOpen(true);
                        }}
                    >
                        <h1 className="truncate text-xl">{questionnaire.title}</h1>
                        <PencilIcon className="text-muted-foreground size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </button>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {questionnaire.status === 'published' && !questionnaire.accepting_responses && (
                        <Badge variant="outline">Paused</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span
                        aria-live="polite"
                        className="text-muted-foreground flex w-24 shrink-0 items-center justify-end gap-1.5 text-sm"
                    >
                        {isSaving ? (
                            <>
                                <LoaderCircleIcon className="size-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <CheckIcon className="size-3.5" />
                                Saved
                            </>
                        )}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Questionnaire settings"
                        onClick={() => {
                            setIsSettingsOpen(true);
                        }}
                    >
                        <SettingsIcon />
                    </Button>
                    {questionnaire.status === 'draft' && (
                        <Button variant="secondary" onClick={publish}>
                            <SendIcon />
                            Publish
                        </Button>
                    )}
                    {questionnaire.status === 'published' && (
                        <Button variant="secondary" onClick={unpublish}>
                            <UndoIcon />
                            Unpublish
                        </Button>
                    )}
                    {questionnaire.status === 'closed' && <Button onClick={publish}>Reopen</Button>}
                    {questionnaire.status === 'published' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="icon" aria-label="Lifecycle actions">
                                        <MoreVerticalIcon />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                {questionnaire.accepting_responses ? (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setAccepting(false);
                                        }}
                                    >
                                        Pause responses
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setAccepting(true);
                                        }}
                                    >
                                        Resume responses
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem variant="destructive" onClick={close}>
                                    Close
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </MainLayoutHeader>

            <div className="flex min-h-0 flex-1 gap-4">
                <QuestionList
                    questionnaire={questionnaire}
                    questions={questions}
                    selectedId={effectiveQuestion?.id}
                    disabled={isReordering}
                    onSelect={setSelectedId}
                    onReorder={handleReorder}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                />
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    {effectiveQuestion ? (
                        <QuestionEditor
                            key={effectiveQuestion.id}
                            questionnaireId={questionnaireId}
                            question={effectiveQuestion}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="flex flex-1 items-center justify-center rounded-xl border">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No questions yet</EmptyTitle>
                                    <EmptyDescription>
                                        Add your first question to start building this questionnaire.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <AddQuestionDialog onSelect={handleAdd} />
                            </Empty>
                        </div>
                    )}
                </div>
            </div>

            <EditDetailsDialog
                key={`details-${questionnaire.updated_at}`}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                questionnaire={questionnaire}
            />

            <QuestionnaireSettingsSheet
                key={`settings-${questionnaire.updated_at}`}
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                questionnaire={questionnaire}
            />
        </>
    );
}

export { QuestionnaireBuilder };
