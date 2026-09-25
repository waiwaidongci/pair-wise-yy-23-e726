import { bulkPut, countStore, getAll, putItem, STORE_NAMES, type StoreName } from "./indexedDb";
import { seedBrailleSymbols, seedLessons } from "../mocks/seedData";
import { seedIdCeiling } from "./nextId";
import { wrapError } from "../utils/errors";

const SEED_FLAG = "braille-trainer:seeded:v1";

/** 首次打开时把点字与课程种子写入 IndexedDB，之后全部读本地 */
export async function ensureSeeded(): Promise<void> {
  try {
    if (localStorage.getItem(SEED_FLAG)) return;
    if ((await countStore(STORE_NAMES.brailleSymbol)) === 0) {
      await bulkPut(STORE_NAMES.brailleSymbol, seedBrailleSymbols);
      seedIdCeiling(STORE_NAMES.brailleSymbol, Math.max(...seedBrailleSymbols.map((s) => s.id)));
    }
    if ((await countStore(STORE_NAMES.lesson)) === 0) {
      await bulkPut(STORE_NAMES.lesson, seedLessons);
      seedIdCeiling(STORE_NAMES.lesson, Math.max(...seedLessons.map((s) => s.id)));
    }
    localStorage.setItem(SEED_FLAG, "1");
  } catch (cause) {
    throw wrapError("LOCAL_DB_FAILED", cause);
  }
}

export async function dbList<T>(store: StoreName): Promise<T[]> {
  try {
    await ensureSeeded();
    return await getAll<T>(store);
  } catch (cause) {
    throw wrapError("LOCAL_DB_FAILED", cause);
  }
}

export async function dbSave<T extends { id: number | string }>(store: StoreName, item: T): Promise<T> {
  try {
    return await putItem(store, item);
  } catch (cause) {
    throw wrapError("LOCAL_DB_FAILED", cause);
  }
}
