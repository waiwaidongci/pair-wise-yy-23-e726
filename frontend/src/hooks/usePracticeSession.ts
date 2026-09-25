import { useCallback, useState } from "react";
import { buildQuestions, completeSession, judgeAnswer } from "../services/PracticeService";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MistakeReason } from "../types/MistakeReason";
import type { PracticeMode } from "../types/PracticeMode";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnsweredQuestion, Question } from "../types/Question";

type Phase = "idle" | "running" | "done";

interface PracticeConfig {
  lessonId: number | null;
  symbols: BrailleSymbol[];
  mode: PracticeMode;
}

// 练习流程状态机：出题 -> 逐题即时判定 -> 结束落库（会话 + 答题记录）
export function usePracticeSession(config: PracticeConfig) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: boolean; reason: MistakeReason | "" } | null>(null);
  const [summary, setSummary] = useState<{ session: PracticeSession; records: AnswerRecord[] } | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [shownAt, setShownAt] = useState(0);

  const current = questions[index] ?? null;
  const isLast = questions.length > 0 && index >= questions.length - 1;

  const start = useCallback(() => {
    const built = buildQuestions(config.symbols, config.mode);
    setQuestions(built);
    setIndex(0);
    setAnswers([]);
    setLastResult(null);
    setSummary(null);
    setStartedAt(new Date().toISOString());
    setShownAt(Date.now());
    setPhase("running");
    if (config.lessonId === null) {
      console.info(LOG_TEMPLATES.MistakeReview[0], built.length);
    }
  }, [config.symbols, config.mode, config.lessonId]);

  const submit = useCallback((rawAnswer: string) => {
    if (!current || lastResult) return null;
    const { correct, reason } = judgeAnswer(current, rawAnswer);
    const answered: AnsweredQuestion = {
      ...current,
      userAnswer: rawAnswer.trim(),
      correct,
      reason,
      latencyMs: Date.now() - shownAt
    };
    setAnswers((prev) => [...prev, answered]);
    setLastResult({ correct, reason });
    return answered;
  }, [current, lastResult, shownAt]);

  const next = useCallback(() => {
    setLastResult(null);
    setIndex((i) => i + 1);
    setShownAt(Date.now());
  }, []);

  const finish = useCallback(async () => {
    const result = await completeSession({
      lessonId: config.lessonId,
      mode: config.mode,
      startedAt,
      answers
    });
    setSummary(result);
    setPhase("done");
    return result;
  }, [answers, config.lessonId, config.mode, startedAt]);

  const reset = useCallback(() => {
    setPhase("idle");
    setQuestions([]);
    setIndex(0);
    setAnswers([]);
    setLastResult(null);
    setSummary(null);
  }, []);

  return { phase, questions, current, index, total: questions.length, answers, lastResult, summary, isLast, start, submit, next, finish, reset };
}
