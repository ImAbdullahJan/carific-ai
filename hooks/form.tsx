import { createFormHook } from "@tanstack/react-form";
import {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} from "./form-context";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";

// Pre-bound Field Components

interface TextFieldProps {
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
}

function TextField({
  label,
  placeholder,
  description,
  type = "text",
  autoComplete,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

// Pre-bound Form Components

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
}

function SubmitButton({
  label,
  loadingLabel = "Submitting...",
  className,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          className={className}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? loadingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}

// Create the form hook with pre-bound components
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubmitButton,
  },
});
