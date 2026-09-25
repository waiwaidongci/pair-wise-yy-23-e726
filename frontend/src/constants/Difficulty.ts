export const Difficulty = ["EASY","MEDIUM","HARD"] as const;
export type Difficulty = (typeof Difficulty)[number];
export const DifficultyText: Record<Difficulty, string> = { EASY: "简单", MEDIUM: "中等", HARD: "困难" };
