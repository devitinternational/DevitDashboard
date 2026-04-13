"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";
import { StepCurriculum } from "@/app/(dashboard)/domains/new/StepCurriculum";
import { StepDetails } from "@/app/(dashboard)/domains/new/StepDetails";
import { StepReview } from "@/app/(dashboard)/domains/new/StepReview";
import { StepTasks } from "@/app/(dashboard)/domains/new/StepTasks";
import { useEffect } from "react";

const STEPS = [
  { label: "Details", description: "Title, pricing & duration" },
  { label: "Curriculum", description: "Sections & lessons" },
  { label: "Tasks", description: "Projects & quizzes" },
  { label: "Review", description: "Publish or save draft" },
];

function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const isDone = index < current;
          const isActive = index === current;
          return (
            <li key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors flex-shrink-0",
                  isDone && "border-foreground bg-foreground text-background",
                  isActive && "border-foreground bg-background text-foreground",
                  !isDone && !isActive && "border-border bg-background text-muted-foreground"
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={cn("text-sm font-medium leading-none", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-4", index < current ? "bg-foreground" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface BuilderClientProps {
  mode?: "create" | "edit";
  initialData?: {
    savedDomainId: string;
    details: any;
    sections: any[];
    tasks: any[];
  };
}

export function DomainBuilderClient({ mode = "create", initialData }: BuilderClientProps) {
  const { step, setDetails, setSavedDomainId, reset } = useBuilderStore();

  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Pre-populate store with existing domain data
      reset();
      setSavedDomainId(initialData.savedDomainId);
      setDetails(initialData.details);
      // Sections and tasks are set via store directly
      useBuilderStore.setState({
        sections: initialData.sections,
        tasks: initialData.tasks,
      });
    } else if (mode === "create") {
      reset();
    }
  }, [mode]);

  const stepComponents = [
    <StepDetails key="details" />,
    <StepCurriculum key="curriculum" />,
    <StepTasks key="tasks" />,
    <StepReview key="review" />,
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "edit" ? "Edit domain" : "Create domain"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "edit"
            ? "Update this internship track"
            : "Set up a new internship track — add content, tasks and publish when ready."}
        </p>
      </div>

      <Stepper current={step} />

      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="mb-5">
          <h2 className="text-base font-semibold">{STEPS[step].label}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
        </div>
        {stepComponents[step]}
      </div>
    </div>
  );
}