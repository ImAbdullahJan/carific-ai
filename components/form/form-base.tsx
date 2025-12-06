"use client";

import { ComponentProps, ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { useFieldContext } from "@/hooks/form-context";

export type FormControlProps = {
  label: string;
  description?: string;
};

type FormBaseProps = FormControlProps & {
  children: ReactNode;
  orientation?: ComponentProps<typeof Field>["orientation"];
  controlFirst?: boolean;
  className?: string;
};

/**
 * Base wrapper for form fields that handles:
 * - Label and description rendering
 * - Error state and display
 * - Orientation (vertical, horizontal, responsive)
 * - Control-first layout (for checkboxes/radios)
 */
export function FormBase({
  children,
  label,
  description,
  orientation,
  controlFirst,
  className,
}: FormBaseProps) {
  const field = useFieldContext();

  // Show errors when field has been touched and has errors
  const isInvalid =
    field.state.meta.errors.length > 0 && field.state.meta.isTouched;

  const labelElement = (
    <>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
    </>
  );

  const errorElement = isInvalid && (
    <FieldError errors={field.state.meta.errors} />
  );

  return (
    <Field
      data-invalid={isInvalid || undefined}
      orientation={orientation}
      className={className}
    >
      {controlFirst ? (
        <>
          {children}
          <FieldContent>
            {labelElement}
            {errorElement}
          </FieldContent>
        </>
      ) : (
        <>
          <FieldContent>{labelElement}</FieldContent>
          {children}
          {errorElement}
        </>
      )}
    </Field>
  );
}
