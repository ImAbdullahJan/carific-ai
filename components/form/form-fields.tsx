"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFieldContext } from "@/hooks/form-context";
import { FormBase, FormControlProps } from "./form-base";

// TextField Component
interface TextFieldProps extends FormControlProps {
  placeholder?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
}

export function TextField({
  label,
  description,
  placeholder,
  type = "text",
  autoComplete,
}: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <FormBase label={label} description={description}>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={field.state.meta.errors.length > 0}
      />
    </FormBase>
  );
}

// CheckboxField Component
type CheckboxFieldProps = FormControlProps;

export function CheckboxField({ label, description }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();

  return (
    <FormBase
      label={label}
      description={description}
      orientation="horizontal"
      controlFirst
    >
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        onBlur={field.handleBlur}
        aria-invalid={field.state.meta.errors.length > 0}
      />
    </FormBase>
  );
}
