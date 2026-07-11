import type { DeleteQuestionnaireDialogProps } from './types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/AlertDialog';

function DeleteQuestionnaireDialog({ open, onOpenChange, questionnaire }: DeleteQuestionnaireDialogProps) {
    const { mutate: deleteQuestionnaire, isPending } = useMutation(deleteQuestionnaireMutationOptions());

    const handleDelete = () => {
        deleteQuestionnaire(questionnaire.id, {
            onSuccess() {
                toast.success('Questionnaire deleted');
                onOpenChange(false);
            },
            onError(error) {
                toast.error(error.message);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete questionnaire</AlertDialogTitle>
                    <AlertDialogDescription>
                        This permanently deletes “{questionnaire.title}” and cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" isLoading={isPending} onClick={handleDelete}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export { DeleteQuestionnaireDialog };
