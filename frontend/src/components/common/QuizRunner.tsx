import { useRef, useState } from "react";
import { useBrailleSymbolStore } from "../../stores/BrailleSymbolStore";
import { PracticePanel } from "./PracticePanel";
import { BrailleCell } from "./BrailleCell";
import { ResultBadge } from "./ResultBadge";
import { AudioButton } from "./AudioButton";
import { usePracticeSession } from "../../hooks/usePracticeSession";
import { buildQuestions, type QuizAnswer, type QuizQuestion } from "../../services/quizService";
import type { PracticeMode } from "../../constants/PracticeMode";
import { MistakeReasonText } from "../../constants/MistakeReason";
import { formatPattern } from "../../utils/formatters";

export interface QuizRunnerProps {
  /** 出题用字符集合（课程字符或错题字符） */
  symbols: import("../../types/BrailleSymbol").BrailleSymbol[];
  mode: PracticeMode;
  /** 交卷回调：负责落库，返回得分 */
  onComplete: (answers: QuizAnswer[]) => Promise<number>;
  onExit?: () => void;
  /** 结算页主按钮 */
  summaryPrimary?: { label: string; onClick: () => void };
  timeoutMs?: number;
}

/**
 * 练习/复习共用的答题运行器：
 * 即时判定 -> 下一题 -> 交卷，持久化策略由 onComplete 注入。
 */
export function QuizRunner({ symbols, mode, onComplete, onExit, summaryPrimary, timeoutMs }: QuizRunnerProps) {
  const allSymbols = useBrailleSymbolStore((s) => s.rows);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuestions(symbols, mode, allSymbols));
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());

  const handleComplete = async (answers: QuizAnswer[]) => {
    const score = await onComplete(answers);
    setFinalScore(score);
  };

  const quiz = usePracticeSession({ questions, onComplete: handleComplete, timeoutMs });

  if (questions.length === 0) return <p className="muted">当前没有可练习的字符。</p>;

  if (quiz.finished && finalScore !== null) {
    const wrongAnswers = quiz.answers.filter((a) => !a.correct);
    const correctCount = quiz.answers.length - wrongAnswers.length;
    return (
      <div className="panel summary">
        <h2>{finalScore >= 80 ? "🎉 达标" : "继续加油"}</h2>
        <p className="summary-score">{finalScore} 分</p>
        <p className="muted">
          答对 {correctCount} 题 / 共 {quiz.answers.length} 题，本次练习记录已保存。
        </p>
        {wrongAnswers.length > 0 ? (
          <ul className="summary-mistakes">
            {wrongAnswers.map((answer, i) => (
              <li key={i}>
                <strong>{answer.question.symbol.letter}</strong>
                <span className="muted">点位 {formatPattern(answer.question.symbol.cell_pattern)}</span>
                <span className="badge badge-danger">
                  {answer.timedOut ? "超时未答" : answer.reason ? MistakeReasonText[answer.reason] : "错误"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="summary-actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              startedAtRef.current = new Date().toISOString();
              setQuestions(buildQuestions(symbols, mode, allSymbols));
              setFinalScore(null);
              quiz.restart();
            }}
          >
            再练一次
          </button>
          {onExit ? (
            <button type="button" className="btn" onClick={onExit}>
              返回
            </button>
          ) : null}
          {summaryPrimary ? (
            <button type="button" className="btn btn-primary" onClick={summaryPrimary.onClick}>
              {summaryPrimary.label}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const { question } = quiz;
  const isChoice = question?.kind === "CELL_TO_TEXT" || question?.kind === "LISTENING";

  return (
    <div className="practice-run">
      <div className="run-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(quiz.progress.answered / quiz.progress.total) * 100}%` }} />
        </div>
        <span>
          {quiz.progress.answered} / {quiz.progress.total}
          {timeoutMs && quiz.remaining > 0 && !quiz.locked ? ` · 剩余 ${Math.ceil(quiz.remaining / 1000)} 秒` : ""}
        </span>
      </div>

      <PracticePanel
        question={question}
        index={quiz.index}
        total={questions.length}
        reveal={quiz.locked}
        audioSlot={question?.kind === "LISTENING" ? <AudioButton symbol={question.symbol} autoPlay /> : undefined}
      >
        {question && isChoice ? (
          <div className="option-grid">
            {question.options.map((option) => {
              let tone = "option";
              if (quiz.locked) {
                if (option.id === question.symbol.id) tone += " correct";
                else if (option.letter === quiz.selected) tone += " wrong";
              }
              return (
                <button
                  key={option.id}
                  type="button"
                  className={tone}
                  disabled={quiz.locked}
                  onClick={() => quiz.selectChoice(option.letter)}
                >
                  {option.letter}
                </button>
              );
            })}
          </div>
        ) : question ? (
          <div className="dot-entry">
            <BrailleCell interactive selected={quiz.dots} onToggleDot={quiz.toggleDot} size="lg" disabled={quiz.locked} />
            <div className="dot-entry-side">
              <p className="muted">点亮该字符对应的点位：{formatPattern(quiz.dots)}</p>
              <button type="button" className="btn btn-primary" onClick={quiz.submitDots} disabled={quiz.locked || quiz.dots.length === 0}>
                提交点位
              </button>
            </div>
          </div>
        ) : null}

        {quiz.judgement ? (
          <div className="judgement-row">
            <ResultBadge correct={quiz.judgement.correct} reason={quiz.judgement.reason} timedOut={quiz.judgement.timedOut} />
            <button type="button" className="btn btn-primary" onClick={() => void quiz.next()}>
              {quiz.isLast ? "查看结果" : "下一题"}
            </button>
          </div>
        ) : null}
      </PracticePanel>
    </div>
  );
}
