import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { QuizAnswer, QuizQuestion } from "../services/quizService";
import { judgeChoice, judgeDots } from "../services/quizService";

export interface UsePracticeSessionOptions {
  questions: QuizQuestion[];
  onComplete?: (answers: QuizAnswer[]) => Promise<void> | void;
  timeoutMs?: number;
}

export interface Judgement {
  correct: boolean;
  reason: QuizAnswer["reason"];
  userAnswer: string;
  timedOut: boolean;
}

/**
 * 练习流程状态机：出题 -> 作答 -> 即时判定 -> 下一题 -> 交卷回调。
 * 课程练习与错题复习共用，持久化由页面传入的 onComplete 决定。
 */
export function usePracticeSession({ questions, onComplete, timeoutMs }: UsePracticeSessionOptions) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dots, setDots] = useState<number[]>([]);
  const [judgement, setJudgement] = useState<Judgement | null>(null);
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(timeoutMs ?? 0);
  const startedAtRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const locked = judgement !== null;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const recordJudgement = useCallback(
    (next: Judgement) => {
      if (!question) return;
      clearTimer();
      const latencyMs = Date.now() - startedAtRef.current;
      setJudgement(next);
      setAnswers((prev) => [
        ...prev,
        {
          question,
          userAnswer: next.userAnswer,
          correct: next.correct,
          reason: next.reason,
          latencyMs,
          timedOut: next.timedOut
        }
      ]);
    },
    [question, clearTimer]
  );

  const selectChoice = useCallback(
    (letter: string) => {
      if (locked || !question) return;
      const result = judgeChoice(question, letter);
      setSelected(letter);
      recordJudgement({ ...result, userAnswer: letter, timedOut: false });
    },
    [locked, question, recordJudgement]
  );

  const toggleDot = useCallback(
    (dot: number) => {
      if (locked) return;
      setDots((prev) => (prev.includes(dot) ? prev.filter((d) => d !== dot) : [...prev, dot]));
    },
    [locked]
  );

  const submitDots = useCallback(() => {
    if (locked || !question) return;
    const result = judgeDots(question, dots);
    recordJudgement({ ...result, userAnswer: dots.slice().sort((a, b) => a - b).join("·"), timedOut: false });
  }, [locked, question, dots, recordJudgement]);

  const timeout = useCallback(() => {
    if (locked || !question) return;
    const answer = question.kind === "TEXT_TO_CELL" ? "" : "—";
    recordJudgement({ correct: false, reason: "TIMEOUT", userAnswer: answer, timedOut: true });
  }, [locked, question, recordJudgement]);

  // 每题启动倒计时与计时基准
  useEffect(() => {
    if (finished || !question || !timeoutMs) return;
    startedAtRef.current = Date.now();
    setRemaining(timeoutMs);
    clearTimer();
    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          clearTimer();
          timeout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return clearTimer;
  }, [index, finished, question, timeoutMs, clearTimer, timeout]);

  const resetQuestionState = useCallback(() => {
    setSelected(null);
    setDots([]);
    setJudgement(null);
    startedAtRef.current = Date.now();
  }, []);

  const next = useCallback(async () => {
    if (!judgement) return;
    if (isLast) {
      setFinished(true);
      clearTimer();
      await onCompleteRef.current?.(answers);
      return;
    }
    setIndex((i) => i + 1);
    resetQuestionState();
  }, [judgement, isLast, answers, clearTimer, resetQuestionState]);

  const restart = useCallback(() => {
    setIndex(0);
    setAnswers([]);
    setFinished(false);
    resetQuestionState();
  }, [resetQuestionState]);

  const progress = useMemo(
    () => ({ answered: answers.length, total: questions.length }),
    [answers.length, questions.length]
  );

  return {
    question,
    index,
    isLast,
    locked,
    finished,
    selected,
    dots,
    judgement,
    answers,
    remaining,
    progress,
    selectChoice,
    toggleDot,
    submitDots,
    next,
    restart
  };
}
