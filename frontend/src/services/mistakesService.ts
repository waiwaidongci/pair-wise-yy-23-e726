import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MistakeReason } from "../constants/MistakeReason";
import type { QuizAnswer } from "./quizService";
import { MistakeReason as MistakeReasons } from "../constants/MistakeReason";
import { bulkSaveAnswerRecord, markAnswerRecordResolved } from "../api/AnswerRecord";
import { savePracticeSession } from "../api/PracticeSession";
import { createPracticeSessionForm } from "../constructors/PracticeSessionConstructor";
import { createAnswerRecordFromJudgement } from "../constructors/AnswerRecordConstructor";
import { nextId } from "../db/nextId";
import { PRACTICE_CONFIG } from "../constants/practiceConfig";

export interface PendingMistake {
  /** 待订正对应的最近一条错题记录 */
  record: AnswerRecord;
  symbol: BrailleSymbol;
  reason: MistakeReason;
  mistakeCount: number;
  lastAt: string;
}

/** 待订正列表：未 resolved 的答错记录，按字符去重保留最近一条，并按原因归类 */
export function groupPendingMistakes(
  records: AnswerRecord[],
  symbols: BrailleSymbol[]
): Map<MistakeReason, PendingMistake[]> {
  const symbolMap = new Map(symbols.map((s) => [s.id, s]));
  const latest = new Map<number, AnswerRecord>();
  const counts = new Map<number, number>();

  [...records]
    .sort((a, b) => a.id - b.id)
    .forEach((record) => {
      if (record.correct || record.resolved || !record.mistake_reason) return;
      latest.set(record.symbol_id, record);
      counts.set(record.symbol_id, (counts.get(record.symbol_id) ?? 0) + 1);
    });

  const result = new Map<MistakeReason, PendingMistake[]>();
  latest.forEach((record, symbolId) => {
    const symbol = symbolMap.get(symbolId);
    if (!symbol || !record.mistake_reason) return;
    const list = result.get(record.mistake_reason) ?? [];
    list.push({
      record,
      symbol,
      reason: record.mistake_reason,
      mistakeCount: counts.get(symbolId) ?? 1,
      lastAt: `#${record.session_id}`
    });
    result.set(record.mistake_reason, list);
  });
  return result;
}

export function pendingMistakeSymbols(
  records: AnswerRecord[],
  symbols: BrailleSymbol[]
): BrailleSymbol[] {
  const grouped = groupPendingMistakes(records, symbols);
  const ids = new Set<number>();
  grouped.forEach((list) => list.forEach((item) => ids.add(item.symbol.id)));
  return symbols.filter((s) => ids.has(s.id));
}

export const REVIEW_LESSON_ID = 0;
export const REVIEW_SOURCE = "REVIEW";

export interface ReviewResult {
  passed: boolean;
  score: number;
  resolvedCount: number;
  sessionId: number;
}

/**
 * 错题复习交卷：
 * - 复习会话仍作为一次 PracticeSession 保存（进度页保留这次练习记录）
 * - 达标（>= PASS_SCORE）时把该字符的待订正错题记录 resolved，从待订正列表移走
 * - 未达标保留在错题本，可继续复习
 */
export async function submitReview(
  answers: QuizAnswer[],
  pendingRecords: AnswerRecord[]
): Promise<ReviewResult> {
  const startedAt = new Date().toISOString();
  const sessionId = nextId("practiceSession");
  const total = answers.length;
  const mistakeCount = answers.filter((a) => !a.correct).length;
  const score = total === 0 ? 0 : Math.round(((total - mistakeCount) / total) * 100);
  const passed = score >= PRACTICE_CONFIG.PASS_SCORE;

  const session = createPracticeSessionForm({
    id: sessionId,
    lesson_id: REVIEW_LESSON_ID,
    mode: "MIXED",
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    total_count: total,
    correct_count: total - mistakeCount,
    mistake_count: mistakeCount,
    source: REVIEW_SOURCE
  });

  const reviewRecords = answers.map((answer) =>
    createAnswerRecordFromJudgement({
      id: nextId("answerRecord"),
      session_id: sessionId,
      symbol_id: answer.question.symbol.id,
      user_answer: answer.userAnswer,
      correct: answer.correct,
      latency_ms: answer.latencyMs,
      mistake_reason: answer.timedOut ? "TIMEOUT" : answer.reason
    })
  );

  await savePracticeSession(session);
  await bulkSaveAnswerRecord(reviewRecords);

  // 本次答对的字符：把历史待订正记录移走
  const passedSymbolIds = new Set(
    answers.filter((a) => a.correct).map((a) => a.question.symbol.id)
  );
  let resolvedCount = 0;
  if (passed) {
    const toResolve = pendingRecords.filter(
      (r) => !r.resolved && !r.correct && passedSymbolIds.has(r.symbol_id)
    );
    // 同字符可能有多条错题，逐条置 resolved 并落日志
    await Promise.all(
      toResolve.map(async (record) => {
        await markAnswerRecordResolved(record);
        resolvedCount += 1;
      })
    );
  }

  return { passed, score, resolvedCount, sessionId };
}

export const ALL_MISTAKE_REASONS: MistakeReason[] = [...MistakeReasons];
