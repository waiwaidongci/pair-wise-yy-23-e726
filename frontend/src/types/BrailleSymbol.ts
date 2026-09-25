import type { Difficulty } from "./Difficulty";
import type { SymbolCategory } from "./SymbolCategory";

export interface BrailleSymbol {
  id: number;
  cell_pattern: string;
  letter: string;
  pinyin: string;
  category: SymbolCategory;
  difficulty: Difficulty;
  audio_hint_key: string;
}
