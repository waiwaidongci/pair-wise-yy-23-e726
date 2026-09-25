import { useCallback, useMemo, useState } from "react";

/**
 * 点字卡片分页/翻页：学习卡片页用。
 * 顺便提供点位编号与布局的公共常量，BrailleCell 组件也依赖它。
 */
export const BRAILLE_DOT_LAYOUT = [1, 4, 2, 5, 3, 6] as const;

export function useBraillePattern<T>(rows: T[] = [], pageSize = 6) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );
  const next = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const prev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
  return { page: safePage, setPage, pageSize, pageRows, total: rows.length, totalPages, next, prev };
}
