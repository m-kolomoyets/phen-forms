import type { QuestionnaireFormSheetProps } from './types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { focusFirstError } from '@/lib/utils/focusFirstError';
import {
    createQuestionnaireMutationOptions,
    updateQuestionnaireMutationOptions,
} from '@/services/questionnaires/queries';
import { useAppForm } from '@/components/Form';
import { Button } from '@/components/ui/Button';
import { FieldGroup, FieldSet } from '@/components/ui/Field';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { questionnaireMetaSchema } from '../../schemas';

const FORM_ID = 'questionnaire-meta-form';

function QuestionnaireFormSheet({ open, onOpenChange, questionnaire }: QuestionnaireFormSheetProps) {
    const isEdit = !!questionnaire;

    const { mutateAsync: createQuestionnaire } = useMutation(createQuestionnaireMutationOptions());
    const { mutateAsync: updateQuestionnaire } = useMutation(updateQuestionnaireMutationOptions());

    const form = useAppForm({
        defaultValues: {
            title: questionnaire?.title ?? '',
            description: questionnaire?.description ?? '',
        },
        validators: { onSubmit: questionnaireMetaSchema },
        async onSubmit({ value }) {
            const payload = {
                title: value.title,
                description: value.description || null,
            };

            try {
                if (isEdit) {
                    await updateQuestionnaire({ id: questionnaire.id, ...payload });
                    toast.success('Questionnaire updated');
                } else {
                    await createQuestionnaire(payload);
                    toast.success('Questionnaire created');
                }

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
        <Sheet
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    form.reset();
                }

                onOpenChange(nextOpen);
            }}
        >
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{isEdit ? 'Edit questionnaire' : 'New questionnaire'}</SheetTitle>
                    <SheetDescription>
                        {isEdit
                            ? 'Update the title and description of your questionnaire.'
                            : 'Give your questionnaire a title and an optional description.'}
                    </SheetDescription>
                </SheetHeader>
                <form
                    id={FORM_ID}
                    noValidate={true}
                    className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldSet>
                        <FieldGroup>
                            <form.AppField
                                name="title"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Title">
                                            <field.InputField placeholder="Untitled questionnaire" />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                            <form.AppField
                                name="description"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Description">
                                            <field.InputField placeholder="What is this survey about?" />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </FieldSet>
                </form>
                <SheetFooter>
                    <form.Subscribe
                        selector={(state) => {
                            return [state.canSubmit, state.isSubmitting] as const;
                        }}
                        children={([canSubmit, isSubmitting]) => {
                            return (
                                <Button type="submit" form={FORM_ID} disabled={!canSubmit} isLoading={isSubmitting}>
                                    {isEdit ? 'Save changes' : 'Create'}
                                </Button>
                            );
                        }}
                    />
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

export { QuestionnaireFormSheet };
