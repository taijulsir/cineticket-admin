import { cn } from "@/lib/utils";

type Step = { id: string; title: string; content: React.ReactNode };

type StepperFormProps = {
  steps: Step[];
  currentStep: number;
};

export function StepperForm({ steps, currentStep }: StepperFormProps) {
  const current = steps[currentStep] ?? steps[0];
  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap gap-3">
        {steps.map((step, index) => (
          <li key={step.id} className={cn("rounded-lg border px-3 py-2 text-sm", index === currentStep ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>
            {index + 1}. {step.title}
          </li>
        ))}
      </ol>
      <div className="rounded-lg border bg-card p-4">{current.content}</div>
    </div>
  );
}

