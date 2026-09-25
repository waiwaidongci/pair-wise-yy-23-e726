import type { Lesson } from "../types/Lesson";
import { STORE_NAMES } from "../db/indexedDb";
import { dbList, dbSave } from "../db/bootstrap";
import { writeLog } from "../utils/logger";

/** 课程 API（本地 IndexedDB 模拟） */
export async function listLesson(): Promise<Lesson[]> {
  return dbList<Lesson>(STORE_NAMES.lesson);
}

export async function saveLesson(payload: Lesson): Promise<Lesson> {
  const saved = await dbSave(STORE_NAMES.lesson, payload);
  writeLog("Lesson", 1, { title: saved.title });
  return saved;
}
