"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useFormContext, useFieldContext } from "@/hooks/form-context";

// SubmitButton Component
interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
}

export function SubmitButton({
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

// ArrayFieldActions Component
interface ArrayFieldActionsProps {
  index: number;
  className?: string;
}

export function ArrayFieldActions<T = unknown>({
  index,
  className,
}: ArrayFieldActionsProps) {
  const field = useFieldContext<T[]>();
  const total = field.state.value?.length ?? 0;

  return (
    <ButtonGroup className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => field.moveValue(index, index - 1)}
        disabled={index === 0}
        className="h-8 w-8 p-0"
        title="Move Up"
        aria-label="Move item up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => field.moveValue(index, index + 1)}
        disabled={index === total - 1}
        className="h-8 w-8 p-0"
        title="Move Down"
        aria-label="Move item down"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => field.removeValue(index)}
        className="h-8 w-8 p-0"
        title="Remove"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </ButtonGroup>
  );
}
