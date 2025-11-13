import { useFieldContext } from "@/components/forms/form-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur"> {
  label?: string;
  description?: string;
}

export function TextField({ label, description, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors.map((error) => error.message).join(", ");

  return (
    <div className="grid gap-2">
      {(label || description) && (
        <div className="flex items-center gap-2">
          {label && <Label>{label}</Label>}
          {description && <span className="text-sm text-muted-foreground">{description}</span>}
        </div>
      )}
      <Input
        {...inputProps}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <p className="text-sm text-destructive min-h-5">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

interface SelectFieldProps<T extends string = string> {
  label: string;
  options: readonly T[];
  description?: string;
}

export function SelectField<T extends string = string>({ label, options, description }: SelectFieldProps<T>) {
  const field = useFieldContext<T>();
  const errors = field.state.meta.errors.map((error) => error.message).join(", ");

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
      <Select value={field.state.value as string} onValueChange={(value) => field.handleChange(value as T)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-destructive min-h-5">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

interface NumberFieldProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "type"> {
  label: string;
  description?: string;
}

export function NumberField({ label, description, ...inputProps }: NumberFieldProps) {
  const field = useFieldContext<number>();
  const errors = field.state.meta.errors.map((error) => error?.message ?? String(error)).join(", ");

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
      <Input
        {...inputProps}
        type="number"
        value={field.state.value?.toString() ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
      />
      <p className="text-sm text-destructive min-h-5">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

interface DateTimeFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "type"> {
  label: string;
  description?: string;
}

export function DateTimeField({ label, description, ...inputProps }: DateTimeFieldProps) {
  const field = useFieldContext<Date>();
  const errors = field.state.meta.errors.map((error) => error?.message ?? String(error)).join(", ");

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
      <Input
        {...inputProps}
        type="datetime-local"
        value={field.state.value instanceof Date ? field.state.value.toISOString().slice(0, 16) : ""}
        onChange={(e) => field.handleChange(new Date(e.target.value))}
        onBlur={field.handleBlur}
      />
      <p className="text-sm text-destructive min-h-5">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

interface MultiSelectFieldProps<T extends string = string> {
  label: string;
  options: readonly T[];
  description?: string;
}

export function MultiSelectField<T extends string = string>({ label, options, description }: MultiSelectFieldProps<T>) {
  const field = useFieldContext<T[]>();
  const errors = field.state.meta.errors.map((error) => error?.message ?? String(error)).join(", ");
  const selectedValues = field.state.value || [];

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
      <Select multiple value={selectedValues} onValueChange={(value) => field.handleChange(value as T[])}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedValues.length === 0
              ? "Select options..."
              : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} selected`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-destructive min-h-5">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}
