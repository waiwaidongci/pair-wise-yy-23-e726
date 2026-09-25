import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";

const DB_NAME = "braille-trainer";
const DB_VERSION = 1;

export const STORE_NAMES = ["brailleSymbol", "lesson", "practiceSession", "answerRecord"] as const;
export type StoreName = (typeof STORE_NAMES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(ERROR_MESSAGES.DB_UNAVAILABLE));
  });
  return dbPromise;
}

function request<T>(store: StoreName, mode: IDBTransactionMode, run: (os: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(store, mode).objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error(ERROR_MESSAGES.DB_UNAVAILABLE));
  }));
}

export async function listAll<T>(store: StoreName): Promise<T[]> {
  const rows = await request(store, "readonly", (os) => os.getAll() as IDBRequest<T[]>);
  return rows ?? [];
}

export async function putOne<T>(store: StoreName, value: T): Promise<T> {
  await request(store, "readwrite", (os) => os.put(value));
  return value;
}

export async function putMany<T>(store: StoreName, values: T[]): Promise<T[]> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(store, "readwrite");
    const os = transaction.objectStore(store);
    values.forEach((value) => os.put(value));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(ERROR_MESSAGES.DB_UNAVAILABLE));
  });
  return values;
}

export async function nextId(store: StoreName): Promise<number> {
  const rows = await listAll<{ id: number }>(store);
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

// 首次打开时把 mocks 里的点字与课程种入 IndexedDB，之后四页共用这份本地数据
export async function ensureSeeded(): Promise<void> {
  const symbols = await listAll<{ id: number }>("brailleSymbol");
  if (symbols.length > 0) return;
  await putMany("brailleSymbol", mockData.brailleSymbol);
  await putMany("lesson", mockData.lesson);
  console.info(LOG_TEMPLATES.BrailleSymbol[0], mockData.brailleSymbol.length);
  console.info(LOG_TEMPLATES.Lesson[0], mockData.lesson.length);
}

export async function clearAll(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([...STORE_NAMES], "readwrite");
    for (const name of STORE_NAMES) {
      transaction.objectStore(name).clear();
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(ERROR_MESSAGES.DB_UNAVAILABLE));
  });
}
