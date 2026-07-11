import type { Questionnaire, QuestionnaireListItem } from '@/services/questionnaires/types';
import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { questionnairesQueryOptions, updateQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import { MainLayoutHeader } from '@/components/layouts/MainLayoutHeader';
import { Button } from '@/components/ui/Button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';
import { DeleteQuestionnaireDialog } from './components/DeleteQuestionnaireDialog';
import { ManageAccessDialog } from './components/ManageAccessDialog';
import { QuestionnaireCard } from './components/QuestionnaireCard';
import { QuestionnaireFormSheet } from './components/QuestionnaireFormSheet';

function Questionnaires() {
    const { data: questionnaires } = useSuspenseQuery(questionnairesQueryOptions());

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Questionnaire | undefined>(undefined);
    const [deleting, setDeleting] = useState<Questionnaire | undefined>(undefined);
    const [managingAccess, setManagingAccess] = useState<QuestionnaireListItem | undefined>(undefined);

    const openCreate = () => {
        setEditing(undefined);
        setIsFormOpen(true);
    };

    const openEdit = (questionnaire: Questionnaire) => {
        setEditing(questionnaire);
        setIsFormOpen(true);
    };

    const { mutate: updateStatus } = useMutation(updateQuestionnaireMutationOptions());

    const toggleStatus = (questionnaire: QuestionnaireListItem) => {
        updateStatus({
            id: questionnaire.id,
            status: questionnaire.status === 'draft' ? 'published' : 'draft',
        });
    };

    return (
        <>
            <MainLayoutHeader className="justify-between">
                <h1 className="text-xl">Questionnaires</h1>
                <Button onClick={openCreate}>
                    <PlusIcon />
                    New questionnaire
                </Button>
            </MainLayoutHeader>

            {questionnaires.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {questionnaires.map((questionnaire) => {
                        return (
                            <QuestionnaireCard
                                key={questionnaire.id}
                                questionnaire={questionnaire}
                                onRename={openEdit}
                                onDelete={setDeleting}
                                onToggleStatus={toggleStatus}
                                onManageAccess={setManagingAccess}
                            />
                        );
                    })}
                </div>
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No questionnaires yet</EmptyTitle>
                        <EmptyDescription>Create your first questionnaire to start building a survey.</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={openCreate}>
                        <PlusIcon />
                        New questionnaire
                    </Button>
                </Empty>
            )}

            <QuestionnaireFormSheet
                key={editing?.id ?? 'create'}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                questionnaire={editing}
            />

            {!!deleting && (
                <DeleteQuestionnaireDialog
                    open={!!deleting}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleting(undefined);
                        }
                    }}
                    questionnaire={deleting}
                />
            )}

            {!!managingAccess && (
                <ManageAccessDialog
                    open={!!managingAccess}
                    onOpenChange={(open) => {
                        if (!open) {
                            setManagingAccess(undefined);
                        }
                    }}
                    questionnaire={managingAccess}
                />
            )}
        </>
    );
}

export { Questionnaires };
