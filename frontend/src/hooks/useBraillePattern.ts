import { useMemo } from "react";
import { parsePattern } from "../utils/braille";

export function useBraillePattern(pattern: string) {
  const dots = useMemo(() => parsePattern(pattern), [pattern]);
  const activeCount = useMemo(() => dots.filter(Boolean).length, [dots]);
  return { dots, activeCount };
}
