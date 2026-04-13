const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

let cachedToken: string | null = null;

async function getAuthHeader(): Promise<Record<string, string>> {
  if (!cachedToken) {
    const res = await fetch("/api/auth/token");
    if (!res.ok) return {};
    const data = await res.json();
    cachedToken = data.token ?? null;
  }
  return cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {};
}

export function clearTokenCache() {
  cachedToken = null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    cachedToken = null;
    throw new Error("Session expired, please sign in again");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "API request failed");
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Domain-specific helpers ────────────────────────────────────────

export type LessonType = "VIDEO_UPLOAD" | "EXTERNAL_VIDEO" | "ARTICLE";
export type TaskType = "PROJECT" | "QUIZ";

export interface DomainPayload {
  title: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  priceINR?: number;
  priceMYR?: number;
  isFree: boolean;
  durationOptions: number[];
  isFeatured: boolean;
}

export interface SectionPayload {
  title: string;
  description?: string;
}

export interface LessonPayload {
  title: string;
  description?: string;
  contentType: LessonType;
  externalUrl?: string;
  articleContent?: string;
  isFree: boolean;
  videoDurationSeconds?: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  taskType: TaskType;
  isRequired: boolean;
  passingScore?: number;
}

export interface QuizOptionPayload {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionPayload {
  question: string;
  explanation?: string;
  options: QuizOptionPayload[];
}

export const domainApi = {
  create: (payload: DomainPayload) =>
    api.post<{ success: boolean; data: { id: string; slug: string } }>("/domains", payload),

  createSection: (domainId: string, payload: SectionPayload) =>
    api.post<{ success: boolean; data: { id: string } }>(`/domains/${domainId}/sections`, payload),

  createLesson: (sectionId: string, payload: LessonPayload) =>
    api.post<{ success: boolean; data: { id: string } }>(`/domains/${sectionId}/lessons`, payload),

  getVideoUploadUrl: (lessonId: string, filename: string, contentType: string) =>
    api.post<{ success: boolean; data: { uploadUrl: string; publicUrl: string; key: string } }>(
      `/domains/lessons/${lessonId}/upload-url`,
      { filename, contentType }
    ),

  updateLesson: (lessonId: string, payload: Partial<LessonPayload> & { videoKey?: string }) =>
    api.put(`/domains/lessons/${lessonId}`, payload),

  createTask: (domainId: string, payload: TaskPayload) =>
    api.post<{ success: boolean; data: { id: string } }>(`/domains/${domainId}/tasks`, payload),

  addQuestion: (taskId: string, payload: QuizQuestionPayload) =>
    api.post(`/domains/tasks/${taskId}/questions`, payload),

  reorderSections: (items: { id: string; orderIndex: number }[]) =>
    api.patch("/domains/sections/reorder", { items }),

  reorderLessons: (items: { id: string; orderIndex: number }[]) =>
    api.patch("/domains/lessons/reorder", { items }),

  publish: (domainId: string) =>
    api.patch<{ success: boolean; data: { published: boolean } }>(`/domains/${domainId}/publish`),
};