"use client";

import { Field } from "@/components/ui/form/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type Option = { label: string; value: string };
type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
};

function ControlledInput<T extends FieldValues>({ control, name, label, type, placeholder, required, disabled, helperText }: Props<T> & { type: string }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <Field label={label} name={field.name} required={required} helperText={helperText} error={fieldState.error?.message}>
        <Input {...field} type={type} value={field.value ?? ""} placeholder={placeholder} disabled={disabled} />
      </Field>
    )} />
  );
}

export function ShortTextInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="text" />; }
export function LongTextInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="text" />; }
export function NumberInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="number" />; }
export function EmailInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="email" />; }
export function PasswordInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="password" />; }
export function DateInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="date" />; }
export function TimeInput<T extends FieldValues>(props: Props<T>) { return <ControlledInput {...props} type="time" />; }

export function TextareaInput<T extends FieldValues>({ control, name, label, placeholder, required, disabled, helperText, rows = 4 }: Props<T> & { rows?: number }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <Field label={label} name={field.name} required={required} helperText={helperText} error={fieldState.error?.message}>
        <textarea {...field} rows={rows} placeholder={placeholder} disabled={disabled} className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </Field>
    )} />
  );
}

export function SelectInput<T extends FieldValues>({ control, name, label, options, required, helperText }: Props<T> & { options: Option[] }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <Field label={label} name={field.name} required={required} helperText={helperText} error={fieldState.error?.message}>
        <select {...field} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Select...</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Field>
    )} />
  );
}

export function MultiSelectInput<T extends FieldValues>({ control, name, label, options, required, helperText }: Props<T> & { options: Option[] }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <Field label={label} name={field.name} required={required} helperText={helperText} error={fieldState.error?.message}>
        <select multiple value={field.value ?? []} onChange={(e) => field.onChange(Array.from(e.target.selectedOptions).map((o) => o.value))} className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm">
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Field>
    )} />
  );
}

export function FileUploadInput<T extends FieldValues>({ control, name, label, required, helperText }: Props<T>) {
  return (
    <Controller control={control} name={name} render={({ fieldState, field }) => (
      <Field label={label} name={field.name} required={required} helperText={helperText} error={fieldState.error?.message}>
        <FileUploadPreview
          value={field.value as File | string | null | undefined}
          onChange={(file) => field.onChange(file)}
        />
      </Field>
    )} />
  );
}

function FileUploadPreview({
  value,
  onChange,
}: {
  value: File | string | null | undefined;
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }
    if (typeof value === "string") {
      setPreview(value);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className={cn("block w-full rounded-md border px-3 py-2 text-sm")}
      />
      {preview ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md border">
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

export function ToggleInput<T extends FieldValues>({ control, name, label, helperText }: Props<T>) {
  return (
    <Controller control={control} name={name} render={({ field }) => (
      <label className="flex items-center justify-between rounded-md border px-3 py-2">
        <div><span className="text-sm font-medium">{label}</span>{helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}</div>
        <input type="checkbox" checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />
      </label>
    )} />
  );
}
