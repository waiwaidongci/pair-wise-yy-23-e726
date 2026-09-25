import { DifficultyText } from "../constants/Difficulty";
import { SymbolCategoryText } from "../constants/SymbolCategory";
import { PracticeModeText } from "../constants/PracticeMode";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { MistakeReasonText } from "../constants/MistakeReason";
import type { Difficulty } from "../constants/Difficulty";
import type { SymbolCategory } from "../types/SymbolCategory";
import type { PracticeMode } from "../types/PracticeMode";
import type { MasteryLevel } from "../constants/MasteryLevel";
import type { MistakeReason } from "../constants/MistakeReason";

export const formatDate = (value: string) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatStatus = (value: string) => value.replace(/_/g, " ");

/** 0-100 -> 百分比文本 */
export const formatPercent = (value: number, digits = 0) => `${(Number.isFinite(value) ? value : 0).toFixed(digits)}%`;

export const formatLatency = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} 秒` : `${Math.round(ms)} ms`);

export const formatDifficulty = (value: Difficulty) => DifficultyText[value] ?? value;
export const formatCategory = (value: SymbolCategory) => SymbolCategoryText[value] ?? value;
export const formatPracticeMode = (value: PracticeMode) => PracticeModeText[value] ?? value;
export const formatMastery = (value: MasteryLevel) => MasteryLevelText[value] ?? value;
export const formatMistakeReason = (value: MistakeReason | null) =>
  value ? MistakeReasonText[value] : "—";

/** 点位数组 -> "1·4·5" 形式，供详情/错题展示 */
export const formatPattern = (dots: number[]) => (dots.length ? [...dots].sort((a, b) => a - b).join("·") : "空方");

/** 保留历史调用：风险等级风格的分数文案 */
export const formatRisk = (value: string) =>
  ({ LOW: "待加强", MEDIUM: "中等", HIGH: "良好", CRITICAL: "优秀", EXTREME: "极好" }[value] ?? value);

/** 得分 -> 评级，进度页与练习结算共用 */
export const formatScoreLevel = (score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =>
  score >= 90 ? "CRITICAL" : score >= 75 ? "HIGH" : score >= 60 ? "MEDIUM" : "LOW";
