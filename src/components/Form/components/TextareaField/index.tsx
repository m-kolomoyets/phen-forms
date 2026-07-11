import type { TextareaProps } from '@/components/ui/Textarea/types';
import { getFieldErrorMessage } from '@/lib/utils/getFieldErrorMessage';
import { Textarea } from '@/components/ui/Textarea';
import { useFieldContext } from '../../context/FormContext';

function TextareaField({ onChange, onBlur, ...props }: Omit<TextareaProps, 'name' | 'id' | 'aria-invalid' | 'value'>) {
    const field = useFieldContext<string | undefined>();
    const fieldErrorMessage = getFieldErrorMessage(field.state.meta.errors);
    const id = `${field.name}${field.form.formId}`;

    return (
        <Textarea
            id={id}
            name={field.name}
            aria-invalid={!!fieldErrorMessage}
            value={field.state.value ?? ''}
            onChange={(e) => {
                field.handleChange(e.target.value);
                onChange?.(e);
            }}
            onBlur={(e) => {
                field.handleBlur();
                onBlur?.(e);
            }}
            {...props}
        />
    );
}

export { TextareaField };
