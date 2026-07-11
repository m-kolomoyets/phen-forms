import type { Questionnaire } from '@/services/questionnaires/types';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { questionnairesQueryOptions } from '@/services/questionnaires/queries';
import { MainLayoutHeader } from '@/components/layouts/MainLayoutHeader';
import { Button } from '@/components/ui/Button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';
import { DeleteQuestionnaireSheet } from './components/DeleteQuestionnaireSheet';
import { QuestionnaireCard } from './components/QuestionnaireCard';
import { QuestionnaireFormSheet } from './components/QuestionnaireFormSheet';

function Questionnaires() {
    const { data: questionnaires } = useSuspenseQuery(questionnairesQueryOptions());

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Questionnaire | undefined>(undefined);
    const [deleting, setDeleting] = useState<Questionnaire | undefined>(undefined);

    const openCreate = () => {
        setEditing(undefined);
        setIsFormOpen(true);
    };

    const openEdit = (questionnaire: Questionnaire) => {
        setEditing(questionnaire);
        setIsFormOpen(true);
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
                                onEdit={openEdit}
                                onDelete={setDeleting}
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
                <DeleteQuestionnaireSheet
                    open={!!deleting}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleting(undefined);
                        }
                    }}
                    questionnaire={deleting}
                />
            )}
        </>
    );
}

export { Questionnaires };
