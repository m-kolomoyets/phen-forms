import type { UpdateQuestionnairePayload } from '@/services/questionnaires/types';
import type { QuestionnaireScreenSchema } from '../../schemas';
import type { ScreenSectionProps } from './types';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FlagIcon, PencilIcon, PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
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
import { questionnaireScreenSchema } from '../../schemas';

const META = {
    welcome: { label: 'Welcome screen', addLabel: 'Add welcome screen', Icon: SparklesIcon },
    ending: { label: 'Ending screen', addLabel: 'Add ending screen', Icon: FlagIcon },
} as const;

function ScreenSection({ kind, questionnaire }: ScreenSectionProps) {
    const { mutateAsync: updateQuestionnaire } = useMutation(updateQuestionnaireMutationOptions());
    const [isEditing, setIsEditing] = useState(false);

    const { label, addLabel, Icon } = META[kind];

    const current =
        kind === 'welcome'
            ? {
                  configured: questionnaire.show_welcome,
                  title: questionnaire.welcome_title,
                  description: questionnaire.welcome_description,
                  bg_url: questionnaire.welcome_bg_url,
              }
            : {
                  configured: questionnaire.show_ending,
                  title: questionnaire.ending_title,
                  description: questionnaire.ending_description,
                  bg_url: questionnaire.ending_bg_url,
              };

    const buildPatch = (values: QuestionnaireScreenSchema | null): UpdateQuestionnairePayload => {
        const enabled = values !== null;
        const title = values?.title || null;
        const description = values?.description || null;
        const bgUrl = values?.bg_url || null;

        if (kind === 'welcome') {
            return {
                id: questionnaire.id,
                show_welcome: enabled,
                welcome_title: title,
                welcome_description: description,
                welcome_bg_url: bgUrl,
            };
        }

        return {
            id: questionnaire.id,
            show_ending: enabled,
            ending_title: title,
            ending_description: description,
            ending_bg_url: bgUrl,
        };
    };

    const FORM_ID = `screen-form-${kind}`;

    const form = useAppForm({
        defaultValues: {
            title: current.title ?? '',
            description: current.description ?? '',
            bg_url: current.bg_url ?? '',
        },
        validators: { onSubmit: questionnaireScreenSchema },
        async onSubmit({ value }) {
            try {
                await updateQuestionnaire(buildPatch(value));
                toast.success(`${label} saved`);
                setIsEditing(false);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong');
            }
        },
        onSubmitInvalid({ formApi }) {
            focusFirstError(`#${FORM_ID}`, formApi.state.errorMap.onSubmit);
        },
    });

    const handleDelete = async () => {
        try {
            await updateQuestionnaire(buildPatch(null));
            toast.success(`${label} removed`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        }
    };

    const openEditor = () => {
        form.reset();
        setIsEditing(true);
    };

    return (
        <>
            <div className="flex min-h-16 flex-col justify-center rounded-lg border px-3 py-2">
                {current.configured ? (
                    <div className="flex items-center gap-2">
                        <Icon className="text-muted-foreground size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                                {label}
                            </p>
                            <p className="truncate text-sm">{current.title || 'Untitled'}</p>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${label}`} onClick={openEditor}>
                            <PencilIcon />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${label}`} onClick={handleDelete}>
                            <Trash2Icon />
                        </Button>
                    </div>
                ) : (
                    <Button variant="ghost" className="w-full justify-start" onClick={openEditor}>
                        <PlusIcon />
                        {addLabel}
                    </Button>
                )}
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription>
                            Shown to respondents {kind === 'welcome' ? 'before' : 'after'} the questions.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        id={FORM_ID}
                        noValidate={true}
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <form.AppField
                            name="title"
                            children={(field) => {
                                return (
                                    <field.FormFieldWrapper label="Title">
                                        <field.InputField
                                            placeholder={kind === 'welcome' ? 'Welcome!' : 'Thank you!'}
                                        />
                                    </field.FormFieldWrapper>
                                );
                            }}
                        />
                        <form.AppField
                            name="description"
                            children={(field) => {
                                return (
                                    <field.FormFieldWrapper label="Description">
                                        <field.TextareaField placeholder="What respondents should know" />
                                    </field.FormFieldWrapper>
                                );
                            }}
                        />
                        <form.AppField
                            name="bg_url"
                            children={(field) => {
                                return (
                                    <field.FormFieldWrapper label="Background image URL">
                                        <field.InputField placeholder="https://…" />
                                    </field.FormFieldWrapper>
                                );
                            }}
                        />
                    </form>
                    <DialogFooter>
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
        </>
    );
}

export { ScreenSection };
