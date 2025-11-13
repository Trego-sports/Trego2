import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { DateTimeField, MultiSelectField, NumberField, SelectField, TextField } from "@/components/forms/form-fields";

// Create and export the form contexts to be used across the app
export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

// Create the form hook with pre-bound field components
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    NumberField,
    DateTimeField,
    MultiSelectField,
  },
  formComponents: {},
});
