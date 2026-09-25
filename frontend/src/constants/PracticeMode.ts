export const PracticeMode = ["CELL_TO_TEXT","TEXT_TO_CELL","LISTENING","MIXED"] as const;
export type PracticeMode = (typeof PracticeMode)[number];
export const PracticeModeText: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "看点识字",
  TEXT_TO_CELL: "听字写点",
  LISTENING: "听音辨字",
  MIXED: "混合模式"
};
