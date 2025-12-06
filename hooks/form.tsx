import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";
import { TextField, CheckboxField } from "@/components/form/form-fields";
import { SubmitButton } from "@/components/form/form-components";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    CheckboxField,
  },
  formComponents: {
    SubmitButton,
  },
});
