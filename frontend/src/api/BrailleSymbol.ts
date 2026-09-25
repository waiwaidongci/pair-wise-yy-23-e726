import { listAll, putOne } from "../utils/localDb";
import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { BrailleSymbol } from "../types/BrailleSymbol";

export async function listBrailleSymbol(): Promise<BrailleSymbol[]> {
  try {
    return await listAll<BrailleSymbol>("brailleSymbol");
  } catch (error) {
    console.error(ERROR_MESSAGES.DB_UNAVAILABLE, error);
    return [...mockData.brailleSymbol];
  }
}

export async function saveBrailleSymbol(payload: BrailleSymbol) {
  console.info(LOG_TEMPLATES.BrailleSymbol[1], payload);
  return putOne("brailleSymbol", payload);
}
