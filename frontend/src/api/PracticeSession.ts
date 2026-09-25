import { listAll, nextId, putOne } from "../utils/localDb";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PracticeSession } from "../types/PracticeSession";

export async function listPracticeSession(): Promise<PracticeSession[]> {
  const rows = await listAll<PracticeSession>("practiceSession");
  return rows.sort((a, b) => a.id - b.id);
}

export async function createPracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  const session = { ...payload, id: payload.id || (await nextId("practiceSession")) };
  console.info(LOG_TEMPLATES.PracticeSession[0], session);
  return putOne("practiceSession", session);
}

export async function savePracticeSession(payload: PracticeSession) {
  console.info(LOG_TEMPLATES.PracticeSession[1], payload);
  return putOne("practiceSession", payload);
}
