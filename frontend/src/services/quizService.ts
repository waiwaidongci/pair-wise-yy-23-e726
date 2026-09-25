import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeMode } from "../types/PracticeMode";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { PracticeSession } from "../types/PracticeSession";
import type { MistakeReason } from "../constants/MistakeReason";
import { PRACTICE_CONFIG } from "../constants/practiceConfig";
import { createAnswerRecordFromJudgement } from "../constructors/AnswerRecordConstructor";
import { createPracticeSessionForm } from "../constructors/PracticeSessionConstructor";
import { nextId } from "../db/nextId";
import { savePracticeSession } from "../api/PracticeSession";
import { bulkSaveAnswerRecord } from "../api/AnswerRecord";

export interface QuizQuestion {
  symbol: BrailleSymbol;
  /** 实际题型：MIXED 在建题时已拆成具体题型 */
  kind: Exclude<PracticeMode, "MIXED">;
  /** 看点识字 / 听写模式的备选项 */
  options: BrailleSymbol[];
}

export interface QuizAnswer {
  question: QuizQuestion;
  userAnswer: string;
  correct: boolean;
  reason: MistakeReason | null;
  latencyMs: number;
  timedOut: boolean;
}

const shuffle = <T>(rows: T[]): T[] => {
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickOptions = (target: BrailleSymbol, pool: BrailleSymbol[]): BrailleSymbol[] => {
  const distractors = shuffle(pool.filter((s) => s.id !== target.id)).slice(0, PRACTICE_CONFIG.OPTION_COUNT - 1);
  const missing = PRACTICE_CONFIG.OPTION_COUNT - 1 - distractors.length;
  if (missing > 0) distractors.push(...pool.filter((s) => s.id !== target.id && !distractors.includes(s)).slice(0, missing));
  return shuffle([target, ...distractors]);
};

const resolveKind = (mode: PracticeMode): QuizQuestion["kind"] => {
  if (mode !== "MIXED") return mode;
  return shuffle(["CELL_TO_TEXT", "TEXT_TO_CELL", "LISTENING"] as const)[0];
};

/** 按课程（或任意字符集合）出题；复习模式传入错题字符即可复用 */
export function buildQuestions(symbols: BrailleSymbol[], mode: PracticeMode, pool: BrailleSymbol[]): QuizQuestion[] {
  return shuffle(symbols).map((symbol) => {
    const kind = resolveKind(mode);
    return {
      symbol,
      kind,
      options: kind === "TEXT_TO_CELL" ? [] : pickOptions(symbol, pool.length >= PRACTICE_CONFIG.OPTION_COUNT ? pool : symbols)
    };
  });
}

/** 选择类题型判定（看点识字 / 听写） */
export function judgeChoice(question: QuizQuestion, selectedLetter: string): Pick<QuizAnswer, "correct" | "reason"> {
  const correct = selectedLetter === question.symbol.letter;
  return { correct, reason: correct ? null : "WRONG_CHARACTER" };
}

/** 点符类题型判定：按漏点 / 多点 / 点号错误归类 */
export function judgeDots(question: QuizQuestion, userDots: number[]): Pick<QuizAnswer, "correct" | "reason"> {
  const expected = new Set(question.symbol.cell_pattern);
  const actual = new Set(userDots);
  const hasMissing = [...expected].some((d) => !actual.has(d));
  const hasExtra = [...actual].some((d) => !expected.has(d));
  if (!hasMissing && !hasExtra) return { correct: true, reason: null };
  if (hasExtra && hasMissing) return { correct: false, reason: "WRONG_DOT" };
  if (hasMissing) return { correct: false, reason: "MISSING_DOT" };
  return { correct: false, reason: "EXTRA_DOT" };
}

export interface SubmitSessionInput {
  lessonId: number;
  mode: PracticeMode;
  startedAt: string;
  answers: QuizAnswer[];
  source?: string | null;
}

export interface SubmitSessionResult {
  session: PracticeSession;
  records: AnswerRecord[];
}

/** 一局结束：生成会话与答题记录并落 IndexedDB，四页之后共享这批数据 */
export async function submitQuizSession(input: SubmitSessionInput): Promise<SubmitSessionResult> {
  const finishedAt = new Date().toISOString();
  const sessionId = nextId("practiceSession");
  const mistakeCount = input.answers.filter((a) => !a.correct).length;

  const session = createPracticeSessionForm({
    id: sessionId,
    lesson_id: input.lessonId,
    mode: input.mode,
    started_at: input.startedAt,
    finished_at: finishedAt,
    total_count: input.answers.length,
    correct_count: input.answers.length - mistakeCount,
    mistake_count: mistakeCount,
    source: input.source ?? null
  });

  const records = input.answers.map((answer) =>
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
  await bulkSaveAnswerRecord(records);
  return { session, records };
}
