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
          {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
        </div>
      )}
      <Input
        {...inputProps}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
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
        {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
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
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
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
        {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
      </div>
      <Input
        {...inputProps}
        type="number"
        value={field.state.value?.toString() ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
      />
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

interface CheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "type"> {
  label: string;
  description?: string;
}

export function CheckboxField({ label, description, ...inputProps }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const errors = field.state.meta.errors.map((error) => error?.message ?? String(error)).join(", ");

  return (
    <div className="grid gap-2">
      <Label className="items-start gap-3">
        <Input
          {...inputProps}
          type="checkbox"
          checked={field.state.value ?? false}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          inputContainerClassName="w-auto pt-0.5"
          className="h-4 w-4"
        />
        <span className="grid gap-1">
          <span>{label}</span>
          {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
        </span>
      </Label>
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
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
        {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
      </div>
      <Input
        {...inputProps}
        type="datetime-local"
        value={field.state.value instanceof Date ? formatLocalDateTime(field.state.value) : ""}
        onChange={(e) => field.handleChange(new Date(e.target.value))}
        onBlur={field.handleBlur}
      />
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}

function formatLocalDateTime(value: Date): string {
  if (Number.isNaN(value.getTime())) return "";

  const pad = (part: number) => part.toString().padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
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
        {description && <span className="text-sm font-medium text-[#647086]">{description}</span>}
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
      <p className="min-h-5 text-sm font-medium text-[#b91c1c]">{!field.state.meta.isValid ? errors : "\u00A0"}</p>
    </div>
  );
}
