import type { AnswerRecord } from "../types/AnswerRecord";
import { STORE_NAMES } from "../db/indexedDb";
import { dbList, dbSave } from "../db/bootstrap";
import { writeLog } from "../utils/logger";

/** 答题记录 API（本地 IndexedDB 模拟） */
export async function listAnswerRecord(): Promise<AnswerRecord[]> {
  return dbList<AnswerRecord>(STORE_NAMES.answerRecord);
}

export async function saveAnswerRecord(payload: AnswerRecord): Promise<AnswerRecord> {
  const saved = await dbSave(STORE_NAMES.answerRecord, payload);
  writeLog("AnswerRecord", 0, { symbol_id: saved.symbol_id, correct: saved.correct });
  return saved;
}

export async function bulkSaveAnswerRecord(payload: AnswerRecord[]): Promise<AnswerRecord[]> {
  // 逐条写以复用写日志要求
  return Promise.all(payload.map((row) => saveAnswerRecord(row)));
}

export async function markAnswerRecordResolved(payload: AnswerRecord): Promise<AnswerRecord> {
  const saved = await dbSave(STORE_NAMES.answerRecord, { ...payload, resolved: true });
  writeLog("AnswerRecord", 2, { symbol_id: saved.symbol_id, resolved: true });
  return saved;
}
