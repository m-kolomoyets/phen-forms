import type { ShareStatus } from '@/services/shares/types';
import type { ManageAccessDialogProps } from './types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { focusFirstError } from '@/lib/utils/focusFirstError';
import { collaboratorsQueryOptions, shareQuestionnaireMutationOptions } from '@/services/shares/queries';
import { useAppForm } from '@/components/Form';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { FieldGroup, FieldSet } from '@/components/ui/Field';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROLE_OPTIONS } from './constants';
import { shareSchema } from '../../schemas';
import { CollaboratorRow } from './components/CollaboratorRow';

const FORM_ID = 'manage-access-form';

function ManageAccessDialog({ open, onOpenChange, questionnaire }: ManageAccessDialogProps) {
    const { mutateAsync: share } = useMutation(shareQuestionnaireMutationOptions());

    const {
        data: collaborators,
        isPending: isCollaboratorsPending,
        isError: isCollaboratorsError,
    } = useQuery({ ...collaboratorsQueryOptions(questionnaire.id), enabled: open });

    const form = useAppForm({
        defaultValues: {
            email: '',
            role: 'editor' as 'editor' | 'viewer',
        },
        validators: { onSubmit: shareSchema },
        async onSubmit({ value, formApi }) {
            try {
                const status = await share({
                    questionnaireId: questionnaire.id,
                    email: value.email,
                    role: value.role,
                });

                const messages: Record<ShareStatus, () => void> = {
                    shared() {
                        toast.success(`Shared with ${value.email}`);
                        formApi.reset();
                    },
                    not_found() {
                        toast.error(`No account found for ${value.email}`);
                    },
                    self() {
                        toast.error('You cannot share with yourself');
                    },
                    forbidden() {
                        toast.error('You cannot manage access for this questionnaire');
                    },
                };

                messages[status]();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong');
            }
        },
        onSubmitInvalid({ formApi }) {
            focusFirstError(`#${FORM_ID}`, formApi.state.errorMap.onSubmit);
        },
    });

    function renderCollaborators() {
        if (isCollaboratorsPending) {
            return (
                <div className="flex flex-col gap-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            );
        }

        if (isCollaboratorsError) {
            return <p className="py-2 text-sm text-destructive">Could not load collaborators.</p>;
        }

        if (collaborators.length === 0) {
            return <p className="py-2 text-sm text-muted-foreground">Not shared with anyone yet.</p>;
        }

        return (
            <ul className="divide-y">
                {collaborators.map((collaborator) => {
                    return (
                        <li key={collaborator.userId}>
                            <CollaboratorRow questionnaireId={questionnaire.id} collaborator={collaborator} />
                        </li>
                    );
                })}
            </ul>
        );
    }

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
                    <DialogTitle>Manage access</DialogTitle>
                    <DialogDescription>
                        Share “{questionnaire.title}” with registered users and set what each may do.
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
                    <FieldSet>
                        <FieldGroup>
                            <form.AppField
                                name="email"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Email">
                                            <field.InputField type="email" placeholder="colleague@example.com" />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                            <form.Field
                                name="role"
                                children={(field) => {
                                    return (
                                        <div className="flex flex-col gap-2">
                                            <span id="manage-access-role-label" className="text-sm font-medium">
                                                Role
                                            </span>
                                            <RadioGroup
                                                aria-labelledby="manage-access-role-label"
                                                value={field.state.value}
                                                onValueChange={(value) => {
                                                    field.handleChange(value as 'editor' | 'viewer');
                                                }}
                                            >
                                                {ROLE_OPTIONS.map((option) => {
                                                    return (
                                                        <Label
                                                            key={option.value}
                                                            className="flex items-start gap-2 font-normal"
                                                        >
                                                            <RadioGroupItem value={option.value} className="mt-0.5" />
                                                            <span className="flex flex-col">
                                                                <span>{option.label}</span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {option.hint}
                                                                </span>
                                                            </span>
                                                        </Label>
                                                    );
                                                })}
                                            </RadioGroup>
                                        </div>
                                    );
                                }}
                            />
                        </FieldGroup>
                    </FieldSet>
                    <form.Subscribe
                        selector={(state) => {
                            return [state.canSubmit, state.isSubmitting] as const;
                        }}
                        children={([canSubmit, isSubmitting]) => {
                            return (
                                <Button
                                    type="submit"
                                    form={FORM_ID}
                                    className="self-start"
                                    disabled={!canSubmit}
                                    isLoading={isSubmitting}
                                >
                                    Add access
                                </Button>
                            );
                        }}
                    />
                </form>

                <Separator />

                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">People with access</span>
                    <ScrollArea className="max-h-48" fade={true}>
                        {renderCollaborators()}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { ManageAccessDialog };
