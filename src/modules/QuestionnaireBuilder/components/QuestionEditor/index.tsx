import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { DragEndEvent } from '@dnd-kit/core';
import type { QuestionType } from '@/lib/questions/constants';
import type { QuestionFormState } from '../../constants';
import type { QuestionEditorProps } from './types';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
    CheckIcon,
    ChevronDownIcon,
    CircleIcon,
    LoaderCircleIcon,
    PlusIcon,
    SquareIcon,
    Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    isOptionQuestionType,
    QUESTION_TYPE_ICON,
    QUESTION_TYPE_LABEL,
    QUESTION_TYPES,
} from '@/lib/questions/constants';
import { questionFormSchema } from '@/lib/questions/schemas';
import { updateQuestionMutationOptions } from '@/services/questions/queries';
import { useAppForm } from '@/components/Form';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { buildQuestionConfig, changeQuestionType, restrictToVerticalAxis, toQuestionFormState } from '../../constants';
import { SortableOptionItem } from './components/SortableOptionItem';

const FORM_ID = 'question-editor-form';

function QuestionEditor({ questionnaireId, question, onDelete }: QuestionEditorProps) {
    const {
        mutate: updateQuestion,
        isPending: isSaving,
        isError: isSaveError,
        isSuccess: isSaved,
    } = useMutation(updateQuestionMutationOptions(questionnaireId));

    // Persist the whole question. Called from the debounced autosave listener
    // and on discrete type switches. Payload building is shared.
    const save = (value: QuestionFormState) => {
        updateQuestion(
            {
                id: question.id,
                type: value.type,
                prompt: value.prompt,
                description: value.description || null,
                required: value.required,
                config: buildQuestionConfig(value),
                options: isOptionQuestionType(value.type)
                    ? value.options.map((option) => {
                          return { label: option.label };
                      })
                    : [],
            },
            {
                onError(error) {
                    toast.error(error instanceof Error ? error.message : 'Something went wrong');
                },
            }
        );
    };

    const form = useAppForm({
        defaultValues: toQuestionFormState(question),
        // Flat form state is a superset of every union member; zod strips the
        // irrelevant keys per type. Cast bridges the convenience shape to the
        // stricter discriminated-union schema. onChange validation drives both
        // live field errors and the autosave gate below.
        validators: { onChange: questionFormSchema as unknown as StandardSchemaV1<QuestionFormState> },
        // Autosave: debounce edits, persist only once the form is valid.
        listeners: {
            onChangeDebounceMs: 800,
            onChange({ formApi }) {
                if (formApi.state.isValid) {
                    save(formApi.state.values);
                }
            },
        },
    });

    // Type is editable via the settings dropdown, so drive rendering off the
    // live form value rather than the (static) question prop.
    const questionType = useStore(form.store, (state) => {
        return state.values.type;
    });
    const allowOther = useStore(form.store, (state) => {
        return state.values.config.allow_other;
    });
    const hasOptions = isOptionQuestionType(questionType);
    const SelectedTypeIcon = QUESTION_TYPE_ICON[questionType];
    const isScale = questionType === 'opinion_scale';
    // DnD reorder of options is offered only for the choice pickers.
    const optionsDraggable = questionType === 'single_choice' || questionType === 'multiple_choice';

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleTypeChange = (nextType: QuestionType) => {
        if (nextType === questionType) {
            return;
        }

        const nextValues = changeQuestionType(form.state.values, nextType);
        form.reset(nextValues);
        // reset() doesn't emit the onChange listener; persist the switch directly
        // when the resulting state is valid.
        if (questionFormSchema.safeParse(nextValues).success) {
            save(nextValues);
        }
    };

    const renderOptionMarker = (index: number) => {
        if (questionType === 'ranking') {
            return <span className="text-muted-foreground w-5 shrink-0 text-center text-sm">{index + 1}</span>;
        }

        const Icon = questionType === 'multiple_choice' ? SquareIcon : CircleIcon;

        return <Icon className="text-muted-foreground size-4 shrink-0" />;
    };

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            {/* Center: question preview in edit mode */}
            <section className="flex-1 overflow-y-auto">
                <form
                    id={FORM_ID}
                    noValidate={true}
                    className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border p-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldSet>
                        <FieldGroup>
                            <form.AppField
                                name="prompt"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Title">
                                            <field.InputField
                                                placeholder="Question title"
                                                className="h-auto py-2 text-lg font-medium"
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
                                            <field.TextareaField placeholder="Add a description (optional)" />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />

                            {hasOptions && (
                                <form.Field
                                    name="options"
                                    mode="array"
                                    children={(field) => {
                                        const optionIds = field.state.value.map((option) => {
                                            return option.id ?? '';
                                        });

                                        const handleOptionDragEnd = ({ active, over }: DragEndEvent) => {
                                            if (!over || active.id === over.id) {
                                                return;
                                            }

                                            const oldIndex = optionIds.indexOf(active.id as string);
                                            const newIndex = optionIds.indexOf(over.id as string);
                                            field.moveValue(oldIndex, newIndex);
                                        };

                                        return (
                                            <Field>
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    modifiers={[restrictToVerticalAxis]}
                                                    onDragEnd={handleOptionDragEnd}
                                                >
                                                    <SortableContext
                                                        items={optionIds}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {field.state.value.map((option, index) => {
                                                            return (
                                                                <SortableOptionItem
                                                                    key={option.id ?? index}
                                                                    id={option.id ?? ''}
                                                                    draggable={optionsDraggable}
                                                                    marker={renderOptionMarker(index)}
                                                                    canRemove={field.state.value.length > 2}
                                                                    removeLabel={`Remove option ${index + 1}`}
                                                                    onRemove={() => {
                                                                        field.removeValue(index);
                                                                    }}
                                                                >
                                                                    <form.AppField
                                                                        name={`options[${index}].label`}
                                                                        children={(optionField) => {
                                                                            return (
                                                                                <optionField.FormFieldWrapper>
                                                                                    <optionField.InputField
                                                                                        placeholder={`Option ${index + 1}`}
                                                                                    />
                                                                                </optionField.FormFieldWrapper>
                                                                            );
                                                                        }}
                                                                    />
                                                                </SortableOptionItem>
                                                            );
                                                        })}
                                                    </SortableContext>
                                                </DndContext>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="self-start w-fit!"
                                                    onClick={() => {
                                                        field.pushValue({ id: crypto.randomUUID(), label: '' });
                                                    }}
                                                >
                                                    <PlusIcon />
                                                    Add option
                                                </Button>
                                                {questionType === 'multiple_choice' && allowOther && (
                                                    <div className="flex items-center gap-2">
                                                        <SquareIcon className="text-muted-foreground size-4 shrink-0" />
                                                        <Input
                                                            placeholder="Other (respondents type their own answer)"
                                                            disabled={true}
                                                        />
                                                    </div>
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            )}

                            {questionType === 'yes_no' && (
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" disabled={true} className="flex-1">
                                        Yes
                                    </Button>
                                    <Button type="button" variant="outline" disabled={true} className="flex-1">
                                        No
                                    </Button>
                                </div>
                            )}

                            {questionType === 'short_text' && <Input placeholder="Short answer text" disabled={true} />}

                            {questionType === 'long_text' && (
                                <div className="text-muted-foreground rounded-md border px-3 py-2 text-sm">
                                    Long answer text
                                </div>
                            )}

                            {isScale && (
                                <div className="flex flex-col gap-3">
                                    <form.Subscribe
                                        selector={(state) => {
                                            return [
                                                state.values.config.scale_min,
                                                state.values.config.scale_max,
                                                state.values.config.scale_step,
                                            ] as const;
                                        }}
                                        children={([min, max, step]) => {
                                            const from = Number.isNaN(min) ? 1 : min;
                                            const to = Number.isNaN(max) ? 10 : max;
                                            const gap = Number.isNaN(step) || step < 1 ? 1 : step;
                                            const points: number[] = [];
                                            if (to > from) {
                                                for (let point = from; point <= to; point += gap) {
                                                    points.push(point);
                                                }
                                            }

                                            return (
                                                <div className="flex flex-wrap gap-2">
                                                    {points.map((point) => {
                                                        return (
                                                            <span
                                                                key={point}
                                                                className="flex size-9 items-center justify-center rounded-md border text-sm"
                                                            >
                                                                {point}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }}
                                    />
                                    <div className="flex gap-3">
                                        <form.AppField
                                            name="config.min_label"
                                            children={(field) => {
                                                return (
                                                    <field.FormFieldWrapper label="Low-end label" className="flex-1">
                                                        <field.InputField placeholder="e.g. Not likely" />
                                                    </field.FormFieldWrapper>
                                                );
                                            }}
                                        />
                                        <form.AppField
                                            name="config.max_label"
                                            children={(field) => {
                                                return (
                                                    <field.FormFieldWrapper label="High-end label" className="flex-1">
                                                        <field.InputField placeholder="e.g. Very likely" />
                                                    </field.FormFieldWrapper>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </FieldGroup>
                    </FieldSet>
                </form>
            </section>

            {/* Right: per-question settings */}
            <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto rounded-xl border p-4">
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Settings</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="sm" className="w-full justify-between">
                                    <span className="flex items-center gap-2">
                                        <SelectedTypeIcon className="text-muted-foreground size-4" />
                                        {QUESTION_TYPE_LABEL[questionType]}
                                    </span>
                                    <ChevronDownIcon />
                                </Button>
                            }
                        />
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup
                                value={questionType}
                                onValueChange={(value) => {
                                    handleTypeChange(value as QuestionType);
                                }}
                            >
                                {QUESTION_TYPES.map((type) => {
                                    const Icon = QUESTION_TYPE_ICON[type];

                                    return (
                                        <DropdownMenuRadioItem key={type} value={type}>
                                            <Icon className="text-muted-foreground size-4" />
                                            {QUESTION_TYPE_LABEL[type]}
                                        </DropdownMenuRadioItem>
                                    );
                                })}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <FieldGroup>
                    <form.Field
                        name="required"
                        children={(field) => {
                            return (
                                <Field orientation="horizontal" className="justify-between">
                                    <FieldLabel htmlFor="question-required">Required</FieldLabel>
                                    <Switch
                                        id="question-required"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => {
                                            field.handleChange(checked);
                                        }}
                                    />
                                </Field>
                            );
                        }}
                    />

                    {hasOptions && (
                        <form.Field
                            name="config.shuffle_options"
                            children={(field) => {
                                return (
                                    <Field orientation="horizontal" className="justify-between">
                                        <FieldLabel htmlFor="question-shuffle">Shuffle options</FieldLabel>
                                        <Switch
                                            id="question-shuffle"
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => {
                                                field.handleChange(checked);
                                            }}
                                        />
                                    </Field>
                                );
                            }}
                        />
                    )}

                    {questionType === 'multiple_choice' && (
                        <form.Field
                            name="config.allow_other"
                            children={(field) => {
                                return (
                                    <Field orientation="horizontal" className="justify-between">
                                        <FieldLabel htmlFor="question-allow-other">
                                            Add &quot;Other&quot; option
                                        </FieldLabel>
                                        <Switch
                                            id="question-allow-other"
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => {
                                                field.handleChange(checked);
                                            }}
                                        />
                                    </Field>
                                );
                            }}
                        />
                    )}

                    {isScale && (
                        <div className="flex gap-3">
                            <form.AppField
                                name="config.scale_min"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Minimum" className="flex-1">
                                            <Input
                                                id={`${field.name}${field.form.formId}`}
                                                type="number"
                                                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                                                onChange={(e) => {
                                                    field.handleChange(e.target.valueAsNumber);
                                                }}
                                                onBlur={field.handleBlur}
                                            />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                            <form.AppField
                                name="config.scale_max"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Maximum" className="flex-1">
                                            <Input
                                                id={`${field.name}${field.form.formId}`}
                                                type="number"
                                                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                                                onChange={(e) => {
                                                    field.handleChange(e.target.valueAsNumber);
                                                }}
                                                onBlur={field.handleBlur}
                                            />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                            <form.AppField
                                name="config.scale_step"
                                children={(field) => {
                                    return (
                                        <field.FormFieldWrapper label="Step" className="flex-1">
                                            <Input
                                                id={`${field.name}${field.form.formId}`}
                                                type="number"
                                                min={1}
                                                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                                                onChange={(e) => {
                                                    field.handleChange(e.target.valueAsNumber);
                                                }}
                                                onBlur={field.handleBlur}
                                            />
                                        </field.FormFieldWrapper>
                                    );
                                }}
                            />
                        </div>
                    )}
                </FieldGroup>

                <div className="mt-auto flex flex-col gap-2">
                    <p
                        aria-live="polite"
                        className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm"
                    >
                        {isSaving && (
                            <>
                                <LoaderCircleIcon className="size-3.5 animate-spin" />
                                Saving…
                            </>
                        )}
                        {!isSaving && isSaveError && <span className="text-destructive">Save failed</span>}
                        {!isSaving && !isSaveError && isSaved && (
                            <>
                                <CheckIcon className="size-3.5" />
                                All changes saved
                            </>
                        )}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onDelete(question);
                        }}
                    >
                        <Trash2Icon />
                        Delete question
                    </Button>
                </div>
            </aside>
        </div>
    );
}

export { QuestionEditor };
