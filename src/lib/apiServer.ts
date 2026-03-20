import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Retrieve the Bearer token from the current server-side session
// ---------------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken ?? null;
}

// ---------------------------------------------------------------------------
// Typed fetch wrapper for server-side route handlers
// ---------------------------------------------------------------------------

interface ServerFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function serverFetch<T = unknown>(
  path: string,
  { method = 'GET', body, headers = {}, isFormData = false }: ServerFetchOptions = {},
): Promise<{ data: T; status: number }> {
  const token = await getToken();

  const reqHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { data: data as T, status: res.status };
}

// ---------------------------------------------------------------------------
// Snake_case → camelCase helpers for backend sermon responses
// ---------------------------------------------------------------------------

export function mapSermon(s: Record<string, any>) {
  return {
    id: s.id,
    title: s.title,
    speaker: s.speaker,
    date: s.date,
    description: s.description ?? null,
    audioUrl: s.audio_url ?? null,
    audioSize: s.audio_size ?? null,
    audioDuration: s.audio_duration ?? null,
    audioFormat: s.audio_format ?? null,
    status: s.status,
    organizationId: s.organization_id,
    recordedById: s.recorded_by_id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    transcribedAt: s.transcribed_at ?? null,
    processedAt: s.processed_at ?? null,
    output: s.output ? mapOutput(s.output) : null,
  };
}

export function mapOutput(o: Record<string, any>) {
  return {
    id: o.id,
    sermonId: o.sermon_id,
    transcript: o.transcript ?? null,
    transcriptWords: o.transcript_words ?? null,
    summary: o.summary ?? null,
    keyPoints: o.key_points ?? [],
    mainThemes: o.main_themes ?? [],
    // Backend returns string[] — map to {reference} objects expected by the frontend
    keyVerses: ((o.key_verses ?? []) as string[]).map((ref: string) => ({ reference: ref })),
    references: o.references ?? [],
    wordCount: o.word_count ?? 0,
    estimatedReadTime: o.estimated_read_time ?? 0,
    processingTime: o.processing_time ?? null,
    aiModel: o.ai_model ?? null,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

// Progress map mirrors the one in the old status route
export const PROGRESS_MAP: Record<string, number> = {
  pending: 0,
  transcribing: 30,
  processing: 60,
  completed: 100,
  failed: 0,
};
