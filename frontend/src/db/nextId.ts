/**
 * 本地自增 ID：IndexedDB 内未开 autoIncrement，
 * 用 localStorage 保存计数器，保证下次打开继续练习时 ID 不冲突。
 */
const PREFIX = "braille-trainer:seq:";

export function nextId(store: string): number {
  const key = `${PREFIX}${store}`;
  const current = Number(localStorage.getItem(key) ?? "0");
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function seedIdCeiling(store: string, maxId: number) {
  const key = `${PREFIX}${store}`;
  const current = Number(localStorage.getItem(key) ?? "0");
  if (maxId > current) localStorage.setItem(key, String(maxId));
}
