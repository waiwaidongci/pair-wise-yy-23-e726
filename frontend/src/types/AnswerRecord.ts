import type { MistakeReason } from "../constants/MistakeReason";

export interface AnswerRecord {
  id: number;
  session_id: number;
  symbol_id: number;
  user_answer: string;
  correct: boolean;
  latency_ms: number;
  /** 答错时归类原因；答对为 null */
  mistake_reason: MistakeReason | null;
  /** 错题复习达标后置 true，即从待订正列表移走 */
  resolved: boolean;
}
