import type { AnswerRecord } from "../types/AnswerRecord";
import type { MistakeReason } from "../constants/MistakeReason";

export const createDefaultAnswerRecord = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: 0,
  session_id: 0,
  symbol_id: 0,
  user_answer: "",
  correct: false,
  latency_ms: 0,
  mistake_reason: null,
  resolved: false,
  ...overrides
});

export interface AnswerRecordInit {
  id: number;
  session_id: number;
  symbol_id: number;
  user_answer: string;
  correct: boolean;
  latency_ms: number;
  mistake_reason?: MistakeReason | null;
}

/** 单题判定后构造答题记录 */
export const createAnswerRecordFromJudgement = (init: AnswerRecordInit): AnswerRecord =>
  createDefaultAnswerRecord({
    id: init.id,
    session_id: init.session_id,
    symbol_id: init.symbol_id,
    user_answer: init.user_answer,
    correct: init.correct,
    latency_ms: init.latency_ms,
    mistake_reason: init.correct ? null : (init.mistake_reason ?? "WRONG_CHARACTER"),
    resolved: false
  });

export const createAnswerRecordForm = createDefaultAnswerRecord;
export const createAnswerRecordResponse = createDefaultAnswerRecord;
