import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, name, required, helperText, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}

