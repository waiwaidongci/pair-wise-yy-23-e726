/**
 * 答错原因枚举：驱动错题本归类与复习达标判定。
 */
export const MistakeReason = [
  "WRONG_DOT",
  "MISSING_DOT",
  "EXTRA_DOT",
  "WRONG_CHARACTER",
  "TIMEOUT"
] as const;
export type MistakeReason = (typeof MistakeReason)[number];
export const MistakeReasonText: Record<MistakeReason, string> = {
  WRONG_DOT: "点号错误",
  MISSING_DOT: "漏点",
  EXTRA_DOT: "多点",
  WRONG_CHARACTER: "字符识别错误",
  TIMEOUT: "超时未答"
};
