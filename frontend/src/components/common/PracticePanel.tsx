import { useEffect, useState } from "react";
import { BrailleCell } from "./BrailleCell";
import { ResultBadge } from "./ResultBadge";
import { STATUS_TEXT } from "../../constants/statusText";
import { dotsToLabel } from "../../utils/braille";
import type { MistakeReason } from "../../types/MistakeReason";
import type { Question } from "../../types/Question";

interface PracticePanelProps {
  question: Question;
  index: number;
  total: number;
  isLast: boolean;
  lastResult: { correct: boolean; reason: MistakeReason | "" } | null;
  onSubmit: (answer: string) => void;
  onNext: () => void;
}

export function PracticePanel({ question, index, total, isLast, lastResult, onSubmit, onNext }: PracticePanelProps) {
  const [answer, setAnswer] = useState("");
  const [trackedQuestion, setTrackedQuestion] = useState(question);
  const { symbol } = question;

  // 题目切换时在提交前同步清空输入，避免旧答案带入下一题
  if (trackedQuestion !== question) {
    setTrackedQuestion(question);
    setAnswer("");
  }

  const speak = () => {
    if (typeof speechSynthesis === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(symbol.pinyin || symbol.letter);
    utterance.lang = "zh-CN";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (question.mode === "LISTENING") speak();
    // 每换一题自动播放一次读音，播放失败时仍可手动点击
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const reasonText = lastResult?.reason ? STATUS_TEXT.MistakeReason[lastResult.reason] : undefined;
  const correctText = question.mode === "TEXT_TO_CELL" ? `${dotsToLabel(symbol.cell_pattern)} 点` : symbol.letter;

  return (
    <div className="practice-panel">
      <div className="practice-head">
        <span>第 {index + 1} / {total} 题</span>
        <span className="badge">{STATUS_TEXT.PracticeMode[question.mode]}</span>
      </div>

      <div className="practice-prompt">
        {question.mode === "CELL_TO_TEXT" && (
          <>
            <BrailleCell pattern={symbol.cell_pattern} size="lg" />
            <p>这个点字是什么字符？</p>
          </>
        )}
        {question.mode === "TEXT_TO_CELL" && (
          <>
            <div className="big-letter">{symbol.letter}</div>
            <p>请写出「{symbol.letter}」的点位（如：134）</p>
          </>
        )}
        {question.mode === "LISTENING" && (
          <>
            <button type="button" className="btn secondary" onClick={speak}>▶ 播放读音</button>
            <p>听读音，写出对应的字符</p>
          </>
        )}
      </div>

      {lastResult ? (
        <>
          <ResultBadge
            correct={lastResult.correct}
            correctText={lastResult.correct ? undefined : correctText}
            reasonText={reasonText}
          />
          <button type="button" className="btn primary" onClick={onNext}>{isLast ? "查看结果" : "下一题"}</button>
        </>
      ) : (
        <form className="answer-form" onSubmit={(event) => { event.preventDefault(); onSubmit(answer); }}>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={question.mode === "TEXT_TO_CELL" ? "输入点位数字，如 134" : "输入字符"}
            autoFocus
          />
          <button type="submit" className="btn primary">提交</button>
        </form>
      )}
    </div>
  );
}
