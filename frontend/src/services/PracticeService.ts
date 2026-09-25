import { createAnswerRecords } from "../api/AnswerRecord";
import { createPracticeSession } from "../api/PracticeSession";
import { createDefaultAnswerRecord } from "../constructors/AnswerRecordConstructor";
import { createDefaultPracticeSession } from "../constructors/PracticeSessionConstructor";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { normalizeDotInput } from "../utils/braille";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MistakeReason } from "../types/MistakeReason";
import type { PracticeMode } from "../types/PracticeMode";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnsweredQuestion, Question } from "../types/Question";

const MIXED_ROTATION: PracticeMode[] = ["CELL_TO_TEXT", "TEXT_TO_CELL", "LISTENING"];

// 按课程字符出题；MIXED 模式按题序轮换三种题型
export function buildQuestions(symbols: BrailleSymbol[], mode: PracticeMode): Question[] {
  return symbols.map((symbol, index) => ({
    symbol,
    mode: mode === "MIXED" ? MIXED_ROTATION[index % MIXED_ROTATION.length] : mode
  }));
}

export function judgeAnswer(question: Question, rawAnswer: string): { correct: boolean; reason: MistakeReason | "" } {
  const answer = rawAnswer.trim();
  if (!answer) return { correct: false, reason: "EMPTY_ANSWER" };
  if (question.mode === "TEXT_TO_CELL") {
    const correct = normalizeDotInput(answer) === question.symbol.cell_pattern;
    return { correct, reason: correct ? "" : "WRONG_CELL" };
  }
  const correct = answer.toLowerCase() === question.symbol.letter.trim().toLowerCase();
  return { correct, reason: correct ? "" : question.mode === "LISTENING" ? "MISHEARD" : "WRONG_SYMBOL" };
}

// 练习结束：写入一场 PracticeSession 和多条 AnswerRecord，错题原因随记录进入错题本
export async function completeSession(input: {
  lessonId: number | null;
  mode: PracticeMode;
  startedAt: string;
  answers: AnsweredQuestion[];
}): Promise<{ session: PracticeSession; records: AnswerRecord[] }> {
  if (input.answers.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_QUESTIONS);
  }
  const mistakes = input.answers.filter((answer) => !answer.correct).length;
  const score = Math.round(((input.answers.length - mistakes) / input.answers.length) * 100);
  const session = await createPracticeSession(createDefaultPracticeSession({
    lesson_id: input.lessonId,
    mode: input.mode,
    started_at: input.startedAt,
    finished_at: new Date().toISOString(),
    score,
    mistake_count: mistakes
  }));
  const records = await createAnswerRecords(input.answers.map((answer) => createDefaultAnswerRecord({
    session_id: session.id,
    symbol_id: answer.symbol.id,
    user_answer: answer.userAnswer,
    correct: answer.correct,
    latency_ms: answer.latencyMs,
    mistake_reason: answer.reason
  })));
  console.info(LOG_TEMPLATES.PracticeSession[4], session);
  return { session, records };
}
