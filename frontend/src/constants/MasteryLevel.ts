export const MasteryLevel = ["NEW","LEARNING","FAMILIAR","MASTERED"] as const;
export type MasteryLevel = (typeof MasteryLevel)[number];
export const MasteryLevelText: Record<MasteryLevel, string> = {
  NEW: "未练习",
  LEARNING: "学习中",
  FAMILIAR: "较熟悉",
  MASTERED: "已掌握"
};
