import type { BrailleSymbol } from "../types/BrailleSymbol";
import { STORE_NAMES } from "../db/indexedDb";
import { dbList, dbSave } from "../db/bootstrap";
import { writeLog } from "../utils/logger";

/** 点字字符 API（本地 IndexedDB 模拟，禁止接入第三方接口） */
export async function listBrailleSymbol(): Promise<BrailleSymbol[]> {
  return dbList<BrailleSymbol>(STORE_NAMES.brailleSymbol);
}

export async function saveBrailleSymbol(payload: BrailleSymbol): Promise<BrailleSymbol> {
  const saved = await dbSave(STORE_NAMES.brailleSymbol, payload);
  writeLog("BrailleSymbol", 1, { letter: saved.letter });
  return saved;
}

export async function exportBrailleSymbol(): Promise<BrailleSymbol[]> {
  const rows = await listBrailleSymbol();
  writeLog("BrailleSymbol", 3, { count: rows.length });
  return rows;
}
