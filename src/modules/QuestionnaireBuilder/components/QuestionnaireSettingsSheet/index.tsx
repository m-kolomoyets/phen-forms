import type { QuestionnaireSettingsSheetProps } from './types';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { focusFirstError } from '@/lib/utils/focusFirstError';
import { updateQuestionnaireMutationOptions } from '@/services/questionnaires/queries';
import { useAppForm } from '@/components/Form';
import { Button } from '@/components/ui/Button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/Field';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';
import { questionnaireSettingsSchema } from '../../schemas';

const FORM_ID = 'questionnaire-settings-form';

function QuestionnaireSettingsSheet({ open, onOpenChange, questionnaire }: QuestionnaireSettingsSheetProps) {
    const { mutateAsync: updateQuestionnaire } = useMutation(updateQuestionnaireMutationOptions());

    const form = useAppForm({
        defaultValues: {
            randomize_questions: questionnaire.randomize_questions,
            show_welcome: questionnaire.show_welcome,
            welcome_title: questionnaire.welcome_title ?? '',
            welcome_description: questionnaire.welcome_description ?? '',
            welcome_bg_url: questionnaire.welcome_bg_url ?? '',
        },
        validators: { onSubmit: questionnaireSettingsSchema },
        async onSubmit({ value }) {
            try {
                await updateQuestionnaire({
                    id: questionnaire.id,
                    randomize_questions: value.randomize_questions,
                    show_welcome: value.show_welcome,
                    welcome_title: value.welcome_title || null,
                    welcome_description: value.welcome_description || null,
                    welcome_bg_url: value.welcome_bg_url || null,
                });
                toast.success('Settings saved');
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
                    <SheetTitle>Questionnaire settings</SheetTitle>
                    <SheetDescription>Welcome screen and question order.</SheetDescription>
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
                            <form.Field
                                name="randomize_questions"
                                children={(field) => {
                                    return (
                                        <Field orientation="horizontal" className="justify-between">
                                            <FieldLabel htmlFor="randomize-questions">
                                                Randomize question order
                                            </FieldLabel>
                                            <Switch
                                                id="randomize-questions"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => {
                                                    field.handleChange(checked);
                                                }}
                                            />
                                        </Field>
                                    );
                                }}
                            />
                            <form.Field
                                name="show_welcome"
                                children={(field) => {
                                    return (
                                        <Field orientation="horizontal" className="justify-between">
                                            <FieldLabel htmlFor="show-welcome">Show welcome screen</FieldLabel>
                                            <Switch
                                                id="show-welcome"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => {
                                                    field.handleChange(checked);
                                                }}
                                            />
                                        </Field>
                                    );
                                }}
                            />

                            <form.Subscribe
                                selector={(state) => {
                                    return state.values.show_welcome;
                                }}
                                children={(showWelcome) => {
                                    if (!showWelcome) {
                                        return null;
                                    }

                                    return (
                                        <>
                                            <form.AppField
                                                name="welcome_title"
                                                children={(field) => {
                                                    return (
                                                        <field.FormFieldWrapper label="Welcome title">
                                                            <field.InputField placeholder="Welcome!" />
                                                        </field.FormFieldWrapper>
                                                    );
                                                }}
                                            />
                                            <form.AppField
                                                name="welcome_description"
                                                children={(field) => {
                                                    return (
                                                        <field.FormFieldWrapper label="Welcome description">
                                                            <field.InputField placeholder="What respondents should know" />
                                                        </field.FormFieldWrapper>
                                                    );
                                                }}
                                            />
                                            <form.AppField
                                                name="welcome_bg_url"
                                                children={(field) => {
                                                    return (
                                                        <field.FormFieldWrapper label="Background image URL">
                                                            <field.InputField placeholder="https://…" />
                                                        </field.FormFieldWrapper>
                                                    );
                                                }}
                                            />
                                        </>
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
                                    Save settings
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

export { QuestionnaireSettingsSheet };
