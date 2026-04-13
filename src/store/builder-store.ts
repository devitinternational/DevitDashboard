import { create } from "zustand";
import type { LessonType, TaskType } from "@/lib/api/domains";

// ── Types ──────────────────────────────────────────────────────────

export interface LessonDraft {
  id: string; // temp client id (crypto.randomUUID())
  title: string;
  description: string;
  contentType: LessonType;
  externalUrl: string;
  articleContent: string;
  isFree: boolean;
  videoFile?: File; // held in memory until upload
  videoKey?: string; // set after S3 upload
  videoDurationSeconds?: number;
  // set after API creates lesson
  savedId?: string;
}

export interface SectionDraft {
  id: string; // temp client id
  title: string;
  description: string;
  lessons: LessonDraft[];
  savedId?: string;
}

export interface QuizOptionDraft {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionDraft {
  id: string;
  question: string;
  explanation: string;
  options: QuizOptionDraft[];
}

export interface TaskDraft {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  isRequired: boolean;
  passingScore: number;
  questions: QuizQuestionDraft[];
  savedId?: string;
}

export interface DomainDetails {
  title: string;
  description: string;
  iconUrl: string;
  bannerUrl: string;
  priceINR: string;
  priceMYR: string;
  isFree: boolean;
  durationOptions: number[];
  isFeatured: boolean;
}

interface BuilderStore {
  step: number;
  setStep: (s: number) => void;

  // Step 1
  details: DomainDetails;
  setDetails: (d: Partial<DomainDetails>) => void;

  // Step 2
  sections: SectionDraft[];
  addSection: (title: string, description?: string, savedId?: string) => void;
  updateSection: (
    id: string,
    patch: Partial<Pick<SectionDraft, "title" | "description" | "savedId">>
  ) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: SectionDraft[]) => void;
  addLesson: (sectionId: string, lesson: Omit<LessonDraft, "id">) => void;
  updateLesson: (sectionId: string, lessonId: string, patch: Partial<LessonDraft>) => void;
  removeLesson: (sectionId: string, lessonId: string) => void;
  reorderLessons: (sectionId: string, lessons: LessonDraft[]) => void;

  // Step 3
  tasks: TaskDraft[];
  addTask: (task: Omit<TaskDraft, "id" | "questions">) => void;
  updateTask: (id: string, patch: Partial<Omit<TaskDraft, "id" | "questions">>) => void;
  removeTask: (id: string) => void;
  reorderTasks: (tasks: TaskDraft[]) => void;
  addQuestion: (taskId: string, q: Omit<QuizQuestionDraft, "id">) => void;
  updateQuestion: (taskId: string, qId: string, patch: Partial<Omit<QuizQuestionDraft, "id">>) => void;
  removeQuestion: (taskId: string, qId: string) => void;

  // Saved domain id (set after step 1 API call)
  savedDomainId: string | null;
  setSavedDomainId: (id: string) => void;

  reset: () => void;
}

const uid = () => crypto.randomUUID();

const defaultDetails: DomainDetails = {
  title: "",
  description: "",
  iconUrl: "",
  bannerUrl: "",
  priceINR: "",
  priceMYR: "",
  isFree: false,
  durationOptions: [1, 3],
  isFeatured: false,
};

export const useBuilderStore = create<BuilderStore>((set) => ({
  step: 0,
  setStep: (step) => set({ step }),

  details: defaultDetails,
  setDetails: (d) => set((s) => ({ details: { ...s.details, ...d } })),

  sections: [],
  addSection: (title, description = "", savedId) =>
    set((s) => ({
      sections: [...s.sections, { id: uid(), title, description, lessons: [], savedId }],
    })),
  updateSection: (id, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
    })),
  removeSection: (id) =>
    set((s) => ({ sections: s.sections.filter((sec) => sec.id !== id) })),
  reorderSections: (sections) => set({ sections }),
  addLesson: (sectionId, lesson) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, lessons: [...sec.lessons, { ...lesson, id: uid() }] }
          : sec
      ),
    })),
  updateLesson: (sectionId, lessonId, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              lessons: sec.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
            }
          : sec
      ),
    })),
  removeLesson: (sectionId, lessonId) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonId) }
          : sec
      ),
    })),
  reorderLessons: (sectionId, lessons) =>
    set((s) => ({
      sections: s.sections.map((sec) => (sec.id === sectionId ? { ...sec, lessons } : sec)),
    })),

  tasks: [],
  addTask: (task) =>
    set((s) => ({ tasks: [...s.tasks, { ...task, id: uid(), questions: [] }] })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  reorderTasks: (tasks) => set({ tasks }),
  addQuestion: (taskId, q) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, questions: [...t.questions, { ...q, id: uid() }] } : t
      ),
    })),
  updateQuestion: (taskId, qId, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              questions: t.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)),
            }
          : t
      ),
    })),
  removeQuestion: (taskId, qId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, questions: t.questions.filter((q) => q.id !== qId) } : t
      ),
    })),

  savedDomainId: null,
  setSavedDomainId: (id) => set({ savedDomainId: id }),

  reset: () =>
    set({ step: 0, details: defaultDetails, sections: [], tasks: [], savedDomainId: null }),
}));
