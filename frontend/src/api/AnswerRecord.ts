import { listAll, nextId, putMany, putOne } from "../utils/localDb";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { AnswerRecord } from "../types/AnswerRecord";

export async function listAnswerRecord(): Promise<AnswerRecord[]> {
  const rows = await listAll<AnswerRecord>("answerRecord");
  return rows.sort((a, b) => a.id - b.id);
}

export async function createAnswerRecords(payloads: AnswerRecord[]): Promise<AnswerRecord[]> {
  let id = await nextId("answerRecord");
  const records = payloads.map((payload) => ({ ...payload, id: payload.id || id++ }));
  console.info(LOG_TEMPLATES.AnswerRecord[4], records.length);
  return putMany("answerRecord", records);
}

export async function saveAnswerRecord(payload: AnswerRecord) {
  console.info(LOG_TEMPLATES.AnswerRecord[1], payload);
  return putOne("answerRecord", payload);
}
