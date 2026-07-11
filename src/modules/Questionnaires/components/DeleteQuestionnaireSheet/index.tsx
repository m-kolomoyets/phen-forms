import type { DeleteQuestionnaireSheetProps } from './types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/Sheet';

function DeleteQuestionnaireSheet({ open, onOpenChange, questionnaire }: DeleteQuestionnaireSheetProps) {
    const { mutate: deleteQuestionnaire, isPending } = useMutation(deleteQuestionnaireMutationOptions());

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Delete questionnaire</SheetTitle>
                    <SheetDescription>
                        This permanently deletes “{questionnaire.title}” and cannot be undone.
                    </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                    <Button
                        type="button"
                        variant="destructive"
                        isLoading={isPending}
                        onClick={() => {
                            deleteQuestionnaire(questionnaire.id, {
                                onSuccess() {
                                    toast.success('Questionnaire deleted');
                                    onOpenChange(false);
                                },
                                onError(error) {
                                    toast.error(error.message);
                                },
                            });
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export { DeleteQuestionnaireSheet };
