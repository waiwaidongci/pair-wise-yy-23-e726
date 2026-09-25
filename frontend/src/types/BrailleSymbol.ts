import type { SymbolCategory } from "./SymbolCategory";
import type { Difficulty } from "../constants/Difficulty";

/**
 * 点字字符：cell_pattern 为凸起的点位编号（盲文 6 点制，编号 1-6）。
 * 点位布局：1 4 / 2 5 / 3 6
 */
export interface BrailleSymbol {
  id: number;
  cell_pattern: number[];
  letter: string;
  pinyin: string;
  category: SymbolCategory;
  difficulty: Difficulty;
  audio_hint_key: string;
}
