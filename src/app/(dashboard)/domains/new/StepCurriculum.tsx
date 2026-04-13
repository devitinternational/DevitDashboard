"use client";

import { useState, useRef } from "react";
import { useBuilderStore, type SectionDraft } from "@/store/builder-store";
import { domainApi, type LessonType } from "@/lib/api/domains";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  GripVertical,
  Plus,
  Trash2,
  Link2,
  FileText,
  Upload,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to save";
}

const LESSON_TYPE_META: Record<
  LessonType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  EXTERNAL_VIDEO: {
    label: "External video",
    icon: <Link2 className="h-3 w-3" />,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  VIDEO_UPLOAD: {
    label: "Upload video",
    icon: <Upload className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  ARTICLE: {
    label: "Article",
    icon: <FileText className="h-3 w-3" />,
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
};

// ── Add Lesson inline form ─────────────────────────────────────────
function AddLessonForm({
  sectionId,
  onDone,
}: {
  sectionId: string;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<LessonType>("EXTERNAL_VIDEO");
  const [externalUrl, setExternalUrl] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Find the saved sectionId
  const { sections, savedDomainId, addLesson } = useBuilderStore();
  const section = sections.find((s) => s.id === sectionId);
  const savedSectionId = section?.savedId;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Lesson title required");
      return;
    }
    if (type === "EXTERNAL_VIDEO" && !externalUrl.trim()) {
      toast.error("Paste a YouTube or Loom URL");
      return;
    }
    if (type === "VIDEO_UPLOAD" && !videoFile) {
      toast.error("Select a video file");
      return;
    }
    if (!savedSectionId) {
      throw new Error("Section hasn't been saved yet");
    }
    if (!savedDomainId) {
      toast.error("Domain not saved yet");
      return;
    }

    setSaving(true);
    try {
      if (!savedSectionId) {
        throw new Error("Section hasn't been saved yet — save section first");
      }

      // 1. Create lesson record
      // ✅ correct — third argument is an object
      const res = await domainApi.createLesson(savedDomainId, savedSectionId, {
        title,
        description: description || undefined,
        contentType: type,
        externalUrl: type === "EXTERNAL_VIDEO" ? externalUrl : undefined,
        articleContent: type === "ARTICLE" ? articleContent : undefined,
        isFree,
      });

      const lessonId = res.data.id;

      // 2. If upload, get presigned URL and upload to R2
      let videoKey: string | undefined;
      if (type === "VIDEO_UPLOAD" && videoFile) {
        const urlRes = await domainApi.getVideoUploadUrl(
          lessonId,
          videoFile.name,
          videoFile.type,
        );
        await fetch(urlRes.data.uploadUrl, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        videoKey = urlRes.data.key;
        await domainApi.updateLesson(lessonId, { videoKey });
        toast.success("Video uploaded");
      }

      // 3. Update local store
      addLesson(sectionId, {
        title,
        description,
        contentType: type,
        externalUrl,
        articleContent,
        isFree,
        videoFile: videoFile ?? undefined,
        videoKey,
        savedId: lessonId,
      });

      toast.success("Lesson added");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4 mt-2">
      <p className="text-sm font-medium">New lesson</p>

      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          placeholder="e.g. What is the DOM?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Content type</Label>
        <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXTERNAL_VIDEO">
              External video (YouTube / Loom)
            </SelectItem>
            <SelectItem value="VIDEO_UPLOAD">
              Upload video (Cloudflare R2)
            </SelectItem>
            <SelectItem value="ARTICLE">Article / MDX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "EXTERNAL_VIDEO" && (
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
        </div>
      )}

      {type === "VIDEO_UPLOAD" && (
        <div className="space-y-2">
          <Label>Video file</Label>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-border rounded-lg py-6 text-sm text-muted-foreground hover:border-foreground/40 transition-colors flex flex-col items-center gap-1"
          >
            <Upload className="h-5 w-5" />
            {videoFile ? videoFile.name : "Click to select video"}
          </button>
        </div>
      )}

      {type === "ARTICLE" && (
        <div className="space-y-2">
          <Label>Content (Markdown / MDX)</Label>
          <Textarea
            placeholder="# Title&#10;&#10;Your article content here..."
            className="min-h-[120px] font-mono text-sm"
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>
          Description{" "}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          placeholder="Short summary of this lesson"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id={`free-${sectionId}`}
          checked={isFree}
          onCheckedChange={setIsFree}
        />
        <Label
          htmlFor={`free-${sectionId}`}
          className="text-sm cursor-pointer flex items-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" /> Free preview (visible before purchase)
        </Label>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Add lesson"
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────
function SectionCard({ section }: { section: SectionDraft }) {
  const { removeSection, removeLesson } = useBuilderStore();
  const [open, setOpen] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 flex-1 text-left">
              <span className="text-sm font-medium">{section.title}</span>
              <span className="text-xs text-muted-foreground">
                {section.lessons.length}{" "}
                {section.lessons.length === 1 ? "lesson" : "lessons"}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          </CollapsibleTrigger>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => removeSection(section.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Lessons */}
        <CollapsibleContent>
          <div className="px-4 py-2 divide-y divide-border">
            {section.lessons.length === 0 && !addingLesson && (
              <p className="text-xs text-muted-foreground py-3 text-center">
                No lessons yet — add one below
              </p>
            )}

            {section.lessons.map((lesson) => {
              const meta = LESSON_TYPE_META[lesson.contentType];
              return (
                <div key={lesson.id} className="flex items-center gap-3 py-2.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab flex-shrink-0" />
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                      meta.color,
                    )}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                  <span className="text-sm flex-1 truncate">
                    {lesson.title}
                  </span>
                  {lesson.isFree && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-5 text-green-600 border-green-300"
                    >
                      preview
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => removeLesson(section.id, lesson.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}

            {addingLesson && (
              <AddLessonForm
                sectionId={section.id}
                onDone={() => setAddingLesson(false)}
              />
            )}
          </div>

          {!addingLesson && (
            <div className="px-4 pb-3">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => setAddingLesson(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add lesson
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Add section form ───────────────────────────────────────────────
function AddSectionForm({ onDone }: { onDone: () => void }) {
  const { savedDomainId, addSection } = useBuilderStore();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Section title required");
      return;
    }
    if (!savedDomainId) {
      toast.error("Save domain details first");
      return;
    }

    setSaving(true);
    try {
      const res = await domainApi.createSection(savedDomainId, { title });
      addSection(title, "", res.data.id);
      toast.success("Section added");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">New section</p>
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          placeholder="e.g. Week 1: HTML Foundations"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Add section"
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Main step ──────────────────────────────────────────────────────
export function StepCurriculum() {
  const { sections, setStep } = useBuilderStore();
  const [addingSection, setAddingSection] = useState(false);

  const handleNext = () => {
    if (sections.length === 0) {
      toast.error("Add at least one section before continuing");
      return;
    }
    const hasLessons = sections.some((s) => s.lessons.length > 0);
    if (!hasLessons) {
      toast.error("Add at least one lesson to a section");
      return;
    }
    setStep(2);
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}

      {addingSection ? (
        <AddSectionForm onDone={() => setAddingSection(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAddingSection(true)}
          className="w-full border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add section
        </button>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => setStep(0)}>
          ← Back
        </Button>
        <Button onClick={handleNext}>Continue to tasks →</Button>
      </div>
    </div>
  );
}
