import { listAll, putOne } from "../utils/localDb";
import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { Lesson } from "../types/Lesson";

export async function listLesson(): Promise<Lesson[]> {
  try {
    const rows = await listAll<Lesson>("lesson");
    return rows.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error(ERROR_MESSAGES.DB_UNAVAILABLE, error);
    return [...mockData.lesson];
  }
}

export async function saveLesson(payload: Lesson) {
  console.info(LOG_TEMPLATES.Lesson[1], payload);
  return putOne("lesson", payload);
}
