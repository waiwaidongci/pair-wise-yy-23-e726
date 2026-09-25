import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";
import type { PracticeSession } from "../types/PracticeSession";
import type { MasteryLevel } from "../constants/MasteryLevel";
import type { Difficulty } from "../constants/Difficulty";
import { PRACTICE_CONFIG } from "../constants/practiceConfig";

const byTime = (a: AnswerRecord, b: AnswerRecord) => a.id - b.id;

/**
 * 每个字符按时间正序的有效答题记录。
 * 已通过复习订正（resolved）的历史错题只保留在错题本/进度记录里，
 * 不再拉低掌握度与正确率。
 */
export function groupRecordsBySymbol(records: AnswerRecord[]): Map<number, AnswerRecord[]> {
  const map = new Map<number, AnswerRecord[]>();
  [...records]
    .sort(byTime)
    .filter((record) => !record.resolved)
    .forEach((record) => {
      const list = map.get(record.symbol_id) ?? [];
      list.push(record);
      map.set(record.symbol_id, list);
    });
  return map;
}

/** 单字符掌握度：看最近 MASTERY_WINDOW 条记录 */
export function masteryOfSymbol(history: AnswerRecord[] | undefined): MasteryLevel {
  if (!history || history.length === 0) return "NEW";
  const window = history.slice(-PRACTICE_CONFIG.MASTERY_WINDOW);
  const accuracy = window.filter((r) => r.correct).length / window.length;
  if (window.length >= PRACTICE_CONFIG.MASTERED_MIN_ATTEMPTS && accuracy >= PRACTICE_CONFIG.MASTERED_ACCURACY) {
    return "MASTERED";
  }
  if (accuracy >= PRACTICE_CONFIG.FAMILIAR_ACCURACY) return "FAMILIAR";
  return "LEARNING";
}

export function masteryMap(records: AnswerRecord[]): Map<number, MasteryLevel> {
  const grouped = groupRecordsBySymbol(records);
  const result = new Map<number, MasteryLevel>();
  grouped.forEach((history, symbolId) => result.set(symbolId, masteryOfSymbol(history)));
  return result;
}

export function accuracyOfSymbol(history: AnswerRecord[] | undefined): number {
  if (!history || history.length === 0) return 0;
  return history.filter((r) => r.correct).length / history.length;
}

/** 仅统计课程练习（错题复习会话 source=REVIEW 不计入课程完成率） */
export function lessonSessions(lessonId: number, sessions: PracticeSession[]): PracticeSession[] {
  return sessions
    .filter((s) => s.lesson_id === lessonId && s.source !== "REVIEW" && s.total_count > 0)
    .sort((a, b) => a.id - b.id);
}

export interface LessonProgressStat {
  lesson: Lesson;
  attempted: number;
  total: number;
  bestScore: number;
  completed: boolean;
  practicedSymbols: number;
  symbolCoverage: number;
}

/** 课程完成率：该课有过达标的练习会话即视为完成 */
export function lessonProgress(
  lesson: Lesson,
  sessions: PracticeSession[],
  records: AnswerRecord[]
): LessonProgressStat {
  const scoped = lessonSessions(lesson.id, sessions);
  const scopedSessionIds = new Set(scoped.map((s) => s.id));
  const scopedRecords = records.filter((r) => scopedSessionIds.has(r.session_id));
  const practicedSymbols = new Set(scopedRecords.map((r) => r.symbol_id));
  const bestScore = scoped.reduce((max, s) => Math.max(max, s.score), 0);
  return {
    lesson,
    attempted: scoped.length,
    total: lesson.symbol_ids.length,
    bestScore,
    completed: bestScore >= PRACTICE_CONFIG.PASS_SCORE,
    practicedSymbols: practicedSymbols.size,
    symbolCoverage: lesson.symbol_ids.length === 0 ? 0 : practicedSymbols.size / lesson.symbol_ids.length
  };
}

export interface OverallProgress {
  completedLessons: number;
  totalLessons: number;
  lessonCompletionRate: number;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  totalSessions: number;
  reviewSessions: number;
}

export function overallProgress(
  lessons: Lesson[],
  sessions: PracticeSession[],
  records: AnswerRecord[]
): OverallProgress {
  const completed = lessons.filter((l) => lessonProgress(l, sessions, records).completed).length;
  const lessonSessionIds = new Set(
    sessions.filter((s) => s.source !== "REVIEW").map((s) => s.id)
  );
  const lessonRecords = records.filter((r) => lessonSessionIds.has(r.session_id));
  return {
    completedLessons: completed,
    totalLessons: lessons.length,
    lessonCompletionRate: lessons.length === 0 ? 0 : completed / lessons.length,
    totalAnswers: lessonRecords.length,
    correctAnswers: lessonRecords.filter((r) => r.correct).length,
    accuracy: lessonRecords.length === 0 ? 0 : lessonRecords.filter((r) => r.correct).length / lessonRecords.length,
    totalSessions: sessions.length,
    reviewSessions: sessions.filter((s) => s.source === "REVIEW").length
  };
}

export interface DifficultyMasteryStat {
  difficulty: Difficulty;
  total: number;
  attempted: number;
  mastered: number;
  learning: number;
  newCount: number;
  accuracy: number;
}

/** 各难度掌握情况：进度页难度分布使用 */
export function difficultyMastery(
  symbols: BrailleSymbol[],
  records: AnswerRecord[]
): DifficultyMasteryStat[] {
  const grouped = groupRecordsBySymbol(records);
  const order: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
  return order.map((difficulty) => {
    const inBucket = symbols.filter((s) => s.difficulty === difficulty);
    const attempted = inBucket.filter((s) => (grouped.get(s.id)?.length ?? 0) > 0);
    return {
      difficulty,
      total: inBucket.length,
      attempted: attempted.length,
      mastered: inBucket.filter((s) => masteryOfSymbol(grouped.get(s.id)) === "MASTERED").length,
      learning: inBucket.filter((s) => {
        const level = masteryOfSymbol(grouped.get(s.id));
        return level === "LEARNING" || level === "FAMILIAR";
      }).length,
      newCount: inBucket.filter((s) => masteryOfSymbol(grouped.get(s.id)) === "NEW").length,
      accuracy:
        attempted.length === 0
          ? 0
          : attempted.reduce((sum, s) => sum + accuracyOfSymbol(grouped.get(s.id)), 0) / attempted.length
    };
  });
}

/** 最近 N 次课程练习的得分趋势 */
export function scoreTrend(sessions: PracticeSession[], limit = 10): PracticeSession[] {
  return sessions
    .filter((s) => s.source !== "REVIEW" && s.total_count > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
    .reverse();
}
