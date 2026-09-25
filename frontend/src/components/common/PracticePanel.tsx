import type { ReactNode } from "react";
import type { QuizQuestion } from "../../services/quizService";
import { BrailleCell } from "./BrailleCell";
import { formatPattern } from "../../utils/formatters";

interface PracticePanelProps {
  question: QuizQuestion | undefined;
  index: number;
  total: number;
  /** 判定后展示正确点位/字符 */
  reveal?: boolean;
  children: ReactNode;
  /** 是否播放读音（听写模式） */
  audioSlot?: ReactNode;
}

/** 练习主面板：题号、题干点符/字符、作答区全部收口在这里 */
export function PracticePanel({ question, index, total, reveal = false, children, audioSlot }: PracticePanelProps) {
  if (!question) return <div className="panel">没有可练习的题目</div>;
  return (
    <div className="panel practice-panel">
      <div className="practice-panel-head">
        <span className="practice-index">
          第 {index + 1} / {total} 题
        </span>
        <span className="practice-kind">
          {question.kind === "CELL_TO_TEXT" ? "看点识字" : question.kind === "TEXT_TO_CELL" ? "看字点符" : "听写练习"}
        </span>
      </div>

      <div className="practice-question">
        {question.kind === "CELL_TO_TEXT" ? (
          <BrailleCell pattern={question.symbol.cell_pattern} size="lg" />
        ) : question.kind === "TEXT_TO_CELL" ? (
          <div className="text-prompt" aria-label="请写出对应点符">
            {question.symbol.letter}
          </div>
        ) : (
          <div className="listen-prompt">
            <div className="listen-ear">🎧</div>
            <p className="muted">请根据听到的读音选择对应字符</p>
          </div>
        )}
        {audioSlot}
        {reveal && (
          <div className="reveal-box">
            <BrailleCell pattern={question.symbol.cell_pattern} size="sm" />
            <p className="reveal-answer">
              正确答案：<strong>{question.symbol.letter}</strong>
              <span className="reveal-pattern">（点位 {formatPattern(question.symbol.cell_pattern)}）</span>
            </p>
          </div>
        )}
      </div>

      <div className="practice-answer">{children}</div>
    </div>
  );
}
