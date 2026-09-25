import type { PracticeMode } from "./PracticeMode";

export interface PracticeSession {
  id: number;
  lesson_id: number | null;
  mode: PracticeMode;
  started_at: string;
  finished_at: string;
  score: number;
  mistake_count: number;
}
