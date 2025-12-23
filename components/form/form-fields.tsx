"use client";

import { format, parse } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/hooks/form-context";
import { FormBase, FormControlProps } from "./form-base";
import { ArrayFieldActions } from "./form-components";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// TextField Component
interface TextFieldProps extends FormControlProps {
  placeholder?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  disabled?: boolean;
}

export function TextField({
  label,
  description,
  placeholder,
  type = "text",
  autoComplete,
  disabled,
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
        disabled={disabled}
        aria-invalid={
          field.state.meta.errors.length > 0 && field.state.meta.isTouched
        }
      />
    </FormBase>
  );
}

// CheckboxField Component
type CheckboxFieldProps = FormControlProps & { disabled?: boolean };

export function CheckboxField({
  label,
  description,
  disabled,
}: CheckboxFieldProps) {
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
        disabled={disabled}
        aria-invalid={
          field.state.meta.errors.length > 0 && field.state.meta.isTouched
        }
      />
    </FormBase>
  );
}

// TextAreaField Component
interface TextAreaFieldProps extends FormControlProps {
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function TextAreaField({
  label,
  description,
  placeholder,
  rows = 3,
  disabled,
}: TextAreaFieldProps) {
  const field = useFieldContext<string>();

  return (
    <FormBase label={label} description={description}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={
          field.state.meta.errors.length > 0 && field.state.meta.isTouched
        }
      />
    </FormBase>
  );
}

// SelectField Component
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends FormControlProps {
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function SelectField({
  label,
  description,
  placeholder = "Select an option",
  options,
  disabled,
}: SelectFieldProps) {
  const field = useFieldContext<string>();

  return (
    <FormBase label={label} description={description}>
      <Select
        value={field.state.value ?? ""}
        onValueChange={(value) => {
          field.handleChange(value);
          field.handleBlur();
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={
            field.state.meta.errors.length > 0 && field.state.meta.isTouched
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormBase>
  );
}

// DateField Component
interface DateFieldProps extends FormControlProps {
  placeholder?: string;
  disabled?: boolean;
}

export function DateField({
  label,
  description,
  disabled,
  placeholder = "Pick a date",
}: DateFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid =
    field.state.meta.errors.length > 0 && field.state.meta.isTouched;

  // Convert string (YYYY-MM-DD) to Date for Calendar
  const dateValue = field.state.value
    ? parse(field.state.value, "yyyy-MM-dd", new Date())
    : undefined;
  const isValidDate = dateValue && !isNaN(dateValue.getTime());

  // Handle date selection from Calendar
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      field.handleChange(format(date, "yyyy-MM-dd"));
    } else {
      field.handleChange("");
    }
  };

  return (
    <FormBase label={label} description={description}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.state.value && "text-muted-foreground"
            )}
            aria-invalid={isInvalid}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isValidDate ? format(dateValue, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </FormBase>
  );
}

// StringArrayField Component - for bullets, highlights, etc.
interface StringArrayFieldProps extends FormControlProps {
  placeholder?: string;
  addButtonText?: string;
}

export function StringArrayField({
  label,
  description,
  placeholder = "Enter item...",
  addButtonText = "Add Item",
}: StringArrayFieldProps) {
  const field = useFieldContext<string[]>();
  const items = field.state.value ?? [];

  const isInvalid =
    field.state.meta.errors.length > 0 && field.state.meta.isTouched;

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldContent>
        <div className="flex items-center justify-between">
          <FieldLabel>{label}</FieldLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => field.pushValue("")}
            className="h-7 text-xs"
            aria-label={addButtonText}
          >
            <Plus className="h-3 w-3 mr-1" />
            {addButtonText}
          </Button>
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium w-5 shrink-0">
              {index + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) => field.replaceValue(index, e.target.value)}
              onBlur={field.handleBlur}
              placeholder={placeholder}
              className="flex-1"
              aria-invalid={isInvalid}
            />
            <ArrayFieldActions index={index} className="shrink-0" />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No items yet. Click &ldquo;{addButtonText}&rdquo; to add one.
          </p>
        )}
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
