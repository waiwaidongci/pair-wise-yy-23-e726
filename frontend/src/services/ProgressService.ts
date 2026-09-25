import { Difficulty } from "../constants/Difficulty";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Difficulty as DifficultyValue } from "../types/Difficulty";
import type { MasteryLevel } from "../types/MasteryLevel";

export function overallAccuracy(records: AnswerRecord[]): number {
  if (records.length === 0) return 0;
  const correct = records.filter((record) => record.correct).length;
  return Math.round((correct / records.length) * 100);
}

// 掌握度：无记录 NEW；≥3 次且正确率 ≥80% MASTERED；正确率 ≥50% FAMILIAR；其余 LEARNING
export function masteryOf(symbolId: number, records: AnswerRecord[]): MasteryLevel {
  const mine = records.filter((record) => record.symbol_id === symbolId);
  if (mine.length === 0) return "NEW";
  const correct = mine.filter((record) => record.correct).length;
  const rate = correct / mine.length;
  if (mine.length >= 3 && rate >= 0.8) return "MASTERED";
  if (rate >= 0.5) return "FAMILIAR";
  return "LEARNING";
}

export interface DifficultyStat {
  difficulty: DifficultyValue;
  total: number;
  byMastery: Record<MasteryLevel, number>;
  masteredPercent: number;
  accuracy: number;
}

export function difficultyBreakdown(symbols: BrailleSymbol[], records: AnswerRecord[]): DifficultyStat[] {
  return Difficulty.map((difficulty) => {
    const mine = symbols.filter((symbol) => symbol.difficulty === difficulty);
    const byMastery: Record<MasteryLevel, number> = { NEW: 0, LEARNING: 0, FAMILIAR: 0, MASTERED: 0 };
    for (const symbol of mine) {
      byMastery[masteryOf(symbol.id, records)] += 1;
    }
    const mineIds = new Set(mine.map((symbol) => symbol.id));
    const mineRecords = records.filter((record) => mineIds.has(record.symbol_id));
    return {
      difficulty,
      total: mine.length,
      byMastery,
      masteredPercent: mine.length === 0 ? 0 : Math.round((byMastery.MASTERED / mine.length) * 100),
      accuracy: overallAccuracy(mineRecords)
    };
  });
}
