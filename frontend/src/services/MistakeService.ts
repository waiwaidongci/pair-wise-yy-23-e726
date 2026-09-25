import { MISTAKE_CLEAR_STREAK } from "../constants/practiceRules";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MistakeReason } from "../types/MistakeReason";

export interface MistakeItem {
  symbol: BrailleSymbol;
  reason: MistakeReason;
  wrongCount: number;
  reviewStreak: number;
  lastRecordId: number;
}

// 某字符最近连续答对次数（答题记录 id 自增，按 id 倒序即时间倒序）
export function reviewStreakOf(symbolId: number, records: AnswerRecord[]): number {
  const mine = records.filter((record) => record.symbol_id === symbolId).sort((a, b) => b.id - a.id);
  let streak = 0;
  for (const record of mine) {
    if (!record.correct) break;
    streak += 1;
  }
  return streak;
}

// 待订正 = 答错过、且之后连续答对次数未达 MISTAKE_CLEAR_STREAK 的字符
export function listPendingMistakes(records: AnswerRecord[], symbols: BrailleSymbol[]): MistakeItem[] {
  const symbolById = new Map(symbols.map((symbol) => [symbol.id, symbol]));
  const wrongBySymbol = new Map<number, AnswerRecord[]>();
  for (const record of records) {
    if (record.correct) continue;
    const list = wrongBySymbol.get(record.symbol_id) ?? [];
    list.push(record);
    wrongBySymbol.set(record.symbol_id, list);
  }
  const items: MistakeItem[] = [];
  for (const [symbolId, wrongs] of wrongBySymbol) {
    const streak = reviewStreakOf(symbolId, records);
    if (streak >= MISTAKE_CLEAR_STREAK) continue;
    const symbol = symbolById.get(symbolId);
    if (!symbol) continue;
    const latest = wrongs.reduce((a, b) => (a.id > b.id ? a : b));
    items.push({
      symbol,
      reason: latest.mistake_reason || "WRONG_SYMBOL",
      wrongCount: wrongs.length,
      reviewStreak: streak,
      lastRecordId: latest.id
    });
  }
  return items.sort((a, b) => b.lastRecordId - a.lastRecordId);
}

export function groupByReason(items: MistakeItem[]): Array<[MistakeReason, MistakeItem[]]> {
  const groups = new Map<MistakeReason, MistakeItem[]>();
  for (const item of items) {
    const list = groups.get(item.reason) ?? [];
    list.push(item);
    groups.set(item.reason, list);
  }
  return [...groups.entries()];
}
