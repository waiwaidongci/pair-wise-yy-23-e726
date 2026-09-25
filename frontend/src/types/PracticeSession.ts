import type { PracticeMode } from "./PracticeMode";

export interface PracticeSession {
  id: number;
  lesson_id: number;
  mode: PracticeMode;
  started_at: string;
  finished_at: string;
  /** 0-100 正确率得分 */
  score: number;
  mistake_count: number;
  total_count: number;
  /** 错题复习会话为 "REVIEW"，普通课程练习为 null */
  source: string | null;
}
