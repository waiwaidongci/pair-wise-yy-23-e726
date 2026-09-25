export const MistakeReason = ["WRONG_SYMBOL","WRONG_CELL","MISHEARD","EMPTY_ANSWER"] as const;
export type MistakeReason = (typeof MistakeReason)[number];
export const MistakeReasonText: Record<MistakeReason, string> = {
  WRONG_SYMBOL: "字符辨识错误",
  WRONG_CELL: "点位记忆错误",
  MISHEARD: "听写辨音错误",
  EMPTY_ANSWER: "未作答"
};
