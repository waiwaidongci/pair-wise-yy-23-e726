import type { Judgement } from "../../hooks/usePracticeSession";
import { MistakeReasonText } from "../../constants/MistakeReason";

interface ResultBadgeProps {
  correct: boolean | null;
  reason?: Judgement["reason"];
  timedOut?: boolean;
}

/** 单题即时判定结果 */
export function ResultBadge({ correct, reason, timedOut }: ResultBadgeProps) {
  if (correct === null) return <span className="badge">待作答</span>;
  if (correct) return <span className="badge badge-success">✓ 回答正确</span>;
  const text = timedOut ? "超时未答" : reason ? MistakeReasonText[reason] : "回答错误";
  return <span className="badge badge-danger">✗ {text}</span>;
}
