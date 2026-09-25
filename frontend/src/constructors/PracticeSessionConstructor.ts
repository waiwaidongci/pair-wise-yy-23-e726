import type { PracticeSession } from "../types/PracticeSession";
import type { PracticeMode } from "../types/PracticeMode";

export interface PracticeSessionInit {
  id: number;
  lesson_id: number;
  mode: PracticeMode;
  total_count: number;
  correct_count: number;
  mistake_count: number;
  started_at: string;
  finished_at: string;
  source?: string | null;
}

/** 根据一局练习的即时统计构造会话对象（响应对象） */
export const createDefaultPracticeSession = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
  id: 0,
  lesson_id: 0,
  mode: "CELL_TO_TEXT",
  started_at: new Date(0).toISOString(),
  finished_at: new Date(0).toISOString(),
  score: 0,
  mistake_count: 0,
  total_count: 0,
  source: null,
  ...overrides
});

/** 练习开始时的表单对象：只包含可提交字段 */
export const createPracticeSessionForm = (init: PracticeSessionInit): PracticeSession => ({
  id: init.id,
  lesson_id: init.lesson_id,
  mode: init.mode,
  started_at: init.started_at,
  finished_at: init.finished_at,
  total_count: init.total_count,
  mistake_count: init.mistake_count,
  score: init.total_count === 0 ? 0 : Math.round((init.correct_count / init.total_count) * 100),
  source: init.source ?? null
});

export const createPracticeSessionResponse = createDefaultPracticeSession;
