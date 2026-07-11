import type { QuestionFieldProps } from '../../types';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Textarea } from '@/components/ui/Textarea';
import { getChoiceConfig, getScaleConfig, getScaleValues } from '../../utils/config';
import { RankingField } from '../RankingField';

function QuestionField({ question, options, draft, error, onChange }: QuestionFieldProps) {
    const inputId = `question-${question.id}`;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-medium">
                    {question.prompt}
                    {question.required && (
                        <span className="text-destructive ml-1" aria-hidden="true">
                            *
                        </span>
                    )}
                </h2>
                {question.description && <p className="text-muted-foreground">{question.description}</p>}
            </div>

            {draft.type === 'single_choice' && (
                <RadioGroup
                    value={draft.optionId}
                    onValueChange={(value) => {
                        onChange({ type: 'single_choice', optionId: value === null ? null : String(value) });
                    }}
                >
                    {options.map((option) => {
                        return (
                            <Label
                                key={option.id}
                                className="flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal has-data-checked:border-primary"
                            >
                                <RadioGroupItem value={option.id} />
                                {option.label}
                            </Label>
                        );
                    })}
                </RadioGroup>
            )}

            {draft.type === 'yes_no' && (
                <RadioGroup
                    value={draft.value}
                    onValueChange={(value) => {
                        onChange({ type: 'yes_no', value: value === 'yes' || value === 'no' ? value : null });
                    }}
                >
                    {(['yes', 'no'] as const).map((value) => {
                        return (
                            <Label
                                key={value}
                                className="flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal capitalize has-data-checked:border-primary"
                            >
                                <RadioGroupItem value={value} />
                                {value}
                            </Label>
                        );
                    })}
                </RadioGroup>
            )}

            {draft.type === 'multiple_choice' && (
                <MultipleChoiceInput
                    question={question}
                    options={options}
                    optionIds={draft.optionIds}
                    otherText={draft.otherText}
                    onChange={onChange}
                />
            )}

            {draft.type === 'ranking' && (
                <RankingField
                    question={question}
                    orderedIds={draft.orderedIds}
                    onChange={(orderedIds) => {
                        onChange({ type: 'ranking', orderedIds });
                    }}
                />
            )}

            {draft.type === 'short_text' && (
                <Input
                    id={inputId}
                    value={draft.text}
                    onChange={(event) => {
                        onChange({ type: 'short_text', text: event.target.value });
                    }}
                />
            )}

            {draft.type === 'long_text' && (
                <Textarea
                    id={inputId}
                    rows={5}
                    value={draft.text}
                    onChange={(event) => {
                        onChange({ type: 'long_text', text: event.target.value });
                    }}
                />
            )}

            {draft.type === 'opinion_scale' && (
                <OpinionScaleInput
                    config={getScaleConfig(question.config)}
                    value={draft.value}
                    onChange={(value) => {
                        onChange({ type: 'opinion_scale', value });
                    }}
                />
            )}

            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

type MultipleChoiceInputProps = {
    question: QuestionFieldProps['question'];
    options: QuestionFieldProps['options'];
    optionIds: string[];
    otherText: string;
    onChange: QuestionFieldProps['onChange'];
};

function MultipleChoiceInput({ question, options, optionIds, otherText, onChange }: MultipleChoiceInputProps) {
    const allowOther = getChoiceConfig(question.config).allow_other;

    const toggle = (optionId: string, checked: boolean) => {
        const next = checked
            ? [...optionIds, optionId]
            : optionIds.filter((id) => {
                  return id !== optionId;
              });

        onChange({ type: 'multiple_choice', optionIds: next, otherText });
    };

    return (
        <div className="flex flex-col gap-2">
            {options.map((option) => {
                return (
                    <Label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal has-data-checked:border-primary"
                    >
                        <Checkbox
                            checked={optionIds.includes(option.id)}
                            onCheckedChange={(checked) => {
                                toggle(option.id, checked);
                            }}
                        />
                        {option.label}
                    </Label>
                );
            })}
            {allowOther && (
                <Input
                    aria-label="Other"
                    placeholder="Other…"
                    value={otherText}
                    onChange={(event) => {
                        onChange({ type: 'multiple_choice', optionIds, otherText: event.target.value });
                    }}
                />
            )}
        </div>
    );
}

type OpinionScaleInputProps = {
    config: ReturnType<typeof getScaleConfig>;
    value: number | null;
    onChange: (value: number) => void;
};

function OpinionScaleInput({ config, value, onChange }: OpinionScaleInputProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {getScaleValues(config).map((scaleValue) => {
                    return (
                        <Button
                            key={scaleValue}
                            type="button"
                            variant={value === scaleValue ? 'default' : 'outline'}
                            className={cn('size-10 p-0')}
                            onClick={() => {
                                onChange(scaleValue);
                            }}
                        >
                            {scaleValue}
                        </Button>
                    );
                })}
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
                <span>{config.min_label}</span>
                <span>{config.max_label}</span>
            </div>
        </div>
    );
}

export { QuestionField };
