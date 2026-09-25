import type { PracticeSession } from "../types/PracticeSession";
import { STORE_NAMES } from "../db/indexedDb";
import { dbList, dbSave } from "../db/bootstrap";
import { writeLog } from "../utils/logger";

/** 练习会话 API（本地 IndexedDB 模拟） */
export async function listPracticeSession(): Promise<PracticeSession[]> {
  return dbList<PracticeSession>(STORE_NAMES.practiceSession);
}

export async function savePracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  const saved = await dbSave(STORE_NAMES.practiceSession, payload);
  writeLog("PracticeSession", 2, {
    id: saved.id,
    lesson_id: saved.lesson_id,
    mode: saved.mode,
    score: saved.score
  });
  return saved;
}
