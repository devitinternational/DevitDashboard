"use client";

import { useState } from "react";
import { useBuilderStore, type TaskDraft } from "@/store/builder-store";
import { domainApi, type TaskType } from "@/lib/api/domains";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  GripVertical,
  Plus,
  Trash2,
  FolderGit2,
  HelpCircle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to save";
}

// ── Quiz question editor ───────────────────────────────────────────
function QuizQuestionEditor({
  taskId,
  taskSavedId,
  onClose,
}: {
  taskId: string;
  taskSavedId?: string;
  onClose: () => void;
}) {
  const { addQuestion } = useBuilderStore();
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
    { id: "3", text: "", isCorrect: false },
    { id: "4", text: "", isCorrect: false },
  ]);
  const [saving, setSaving] = useState(false);

  const toggleCorrect = (id: string) => {
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  const handleSave = async () => {
    if (!question.trim()) { toast.error("Question text required"); return; }
    const filled = options.filter((o) => o.text.trim());
    if (filled.length < 2) { toast.error("Add at least 2 answer options"); return; }
    if (!filled.some((o) => o.isCorrect)) { toast.error("Mark at least one option as correct"); return; }

    setSaving(true);
    try {
      if (!taskSavedId) throw new Error("Task not saved yet");

      const payload = {
        question,
        explanation: explanation || undefined,
        options: filled.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      };

      await domainApi.addQuestion(taskSavedId, payload);

      addQuestion(taskId, {
        question,
        explanation,
        options: filled.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
      });

      toast.success("Question added");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4 mt-3">
      <p className="text-sm font-medium">New question</p>

      <div className="space-y-2">
        <Label>Question *</Label>
        <Textarea
          placeholder="e.g. What does CSS stand for?"
          className="min-h-[72px]"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Answer options <span className="text-muted-foreground text-xs">(click the circle to mark correct)</span></Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCorrect(opt.id)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  opt.isCorrect
                    ? "border-green-500 bg-green-500"
                    : "border-border hover:border-green-400"
                )}
              >
                {opt.isCorrect && <Check className="h-2.5 w-2.5 text-white" />}
              </button>
              <Input
                placeholder={`Option ${i + 1}`}
                value={opt.text}
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Explanation <span className="text-muted-foreground text-xs">(shown after answering)</span></Label>
        <Input
          placeholder="Why is this the correct answer?"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</> : "Save question"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Task card ──────────────────────────────────────────────────────
function TaskCard({ task }: { task: TaskDraft }) {
  const { removeTask, removeQuestion } = useBuilderStore();
  const [open, setOpen] = useState(true);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const isQuiz = task.taskType === "QUIZ";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 flex-1 text-left">
              {isQuiz ? (
                <HelpCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
              ) : (
                <FolderGit2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{task.title}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5 px-1.5",
                  isQuiz
                    ? "text-purple-700 border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300"
                    : "text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300"
                )}
              >
                {isQuiz ? "quiz" : "project"}
              </Badge>
              {task.isRequired && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 text-muted-foreground">
                  required
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={() => removeTask(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="px-4 py-3 space-y-3">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}

            {isQuiz && (
              <>
                <p className="text-xs text-muted-foreground">
                  Passing score: <span className="font-medium text-foreground">{task.passingScore}%</span>
                  {" · "}
                  {task.questions.length} question{task.questions.length !== 1 ? "s" : ""}
                </p>

                {task.questions.map((q, qi) => (
                  <div key={q.id} className="bg-muted/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground mt-0.5 flex-shrink-0">Q{qi + 1}.</span>
                      <p className="text-sm font-medium flex-1">{q.question}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive flex-shrink-0 -mt-0.5"
                        onClick={() => removeQuestion(task.id, q.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 pl-5">
                      {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-3.5 w-3.5 rounded-full border flex-shrink-0",
                              opt.isCorrect
                                ? "bg-green-500 border-green-500"
                                : "border-border"
                            )}
                          />
                          <span className={cn("text-xs", opt.isCorrect && "text-green-700 dark:text-green-400 font-medium")}>
                            {opt.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {addingQuestion ? (
                  <QuizQuestionEditor
                    taskId={task.id}
                    taskSavedId={task.savedId}
                    onClose={() => setAddingQuestion(false)}
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setAddingQuestion(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add question
                  </Button>
                )}
              </>
            )}

            {!isQuiz && (
              <p className="text-xs text-muted-foreground">
                Learners will submit a GitHub repository URL for review.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Add task form ──────────────────────────────────────────────────
function AddTaskForm({ onDone }: { onDone: () => void }) {
  const { savedDomainId, addTask } = useBuilderStore();
  const [tab, setTab] = useState<TaskType>("PROJECT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [passingScore, setPassingScore] = useState(70);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Task title required"); return; }
    if (!savedDomainId) { toast.error("Save domain details first"); return; }

    setSaving(true);
    try {
      const res = await domainApi.createTask(savedDomainId, {
        title,
        description: description || undefined,
        taskType: tab,
        isRequired,
        passingScore: tab === "QUIZ" ? passingScore : undefined,
      });

      addTask({
        title,
        description,
        taskType: tab,
        isRequired,
        passingScore,
        savedId: res.data.id,
      });

      toast.success("Task added");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-4">
      <p className="text-sm font-medium">New task</p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TaskType)}>
        <TabsList className="h-8">
          <TabsTrigger value="PROJECT" className="text-xs h-7 flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5" /> Project submission
          </TabsTrigger>
          <TabsTrigger value="QUIZ" className="text-xs h-7 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> Quiz (MCQ)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="PROJECT" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Build a Portfolio Website" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What should learners build and submit?"
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="QUIZ" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. HTML & CSS Assessment" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passing score (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input placeholder="What topics does this quiz cover?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2">
        <Switch id="required" checked={isRequired} onCheckedChange={setIsRequired} />
        <Label htmlFor="required" className="text-sm cursor-pointer">
          Required to earn certificate
        </Label>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</> : "Add task"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Main step ──────────────────────────────────────────────────────
export function StepTasks() {
  const { tasks, setStep } = useBuilderStore();
  const [addingTask, setAddingTask] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Tasks are graded milestones learners must complete to earn their certificate. Add project submissions and quizzes here.
        </p>
      </div>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}

      {addingTask ? (
        <AddTaskForm onDone={() => setAddingTask(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAddingTask(true)}
          className="w-full border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
        <Button onClick={() => setStep(3)}>Review & publish →</Button>
      </div>
    </div>
  );
}
