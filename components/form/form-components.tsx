"use client";

import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/form-context";

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
