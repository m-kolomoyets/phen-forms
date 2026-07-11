import type { EditDetailsDialogProps } from './types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { focusFirstError } from '@/lib/utils/focusFirstError';
import { updateQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import { useAppForm } from '@/components/Form';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { FieldGroup } from '@/components/ui/Field';
import { questionnaireDetailsSchema } from '../../schemas';

const FORM_ID = 'questionnaire-details-form';

function EditDetailsDialog({ open, onOpenChange, questionnaire }: EditDetailsDialogProps) {
    const { mutateAsync: updateQuestionnaire } = useMutation(updateQuestionnaireMutationOptions());

    const form = useAppForm({
        defaultValues: {
            title: questionnaire.title,
            description: questionnaire.description ?? '',
        },
        validators: { onSubmit: questionnaireDetailsSchema },
        async onSubmit({ value }) {
            try {
                await updateQuestionnaire({
                    id: questionnaire.id,
                    title: value.title,
                    description: value.description || null,
                });
                toast.success('Details saved');
                onOpenChange(false);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong');
            }
        },
        onSubmitInvalid({ formApi }) {
            focusFirstError(`#${FORM_ID}`, formApi.state.errorMap.onSubmit);
        },
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    form.reset();
                }

                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit details</DialogTitle>
                    <DialogDescription>Name and description of this questionnaire.</DialogDescription>
                </DialogHeader>
                <form
                    id={FORM_ID}
                    noValidate={true}
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.AppField
                            name="title"
                            children={(field) => {
                                return (
                                    <field.FormFieldWrapper label="Name">
                                        <field.InputField placeholder="Questionnaire name" />
                                    </field.FormFieldWrapper>
                                );
                            }}
                        />
                        <form.AppField
                            name="description"
                            children={(field) => {
                                return (
                                    <field.FormFieldWrapper label="Description">
                                        <field.TextareaField placeholder="What this questionnaire is about (optional)" />
                                    </field.FormFieldWrapper>
                                );
                            }}
                        />
                    </FieldGroup>
                </form>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <form.Subscribe
                        selector={(state) => {
                            return [state.canSubmit, state.isSubmitting] as const;
                        }}
                        children={([canSubmit, isSubmitting]) => {
                            return (
                                <Button type="submit" form={FORM_ID} disabled={!canSubmit} isLoading={isSubmitting}>
                                    Save
                                </Button>
                            );
                        }}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { EditDetailsDialog };
