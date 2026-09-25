import type { BrailleSymbol } from "./BrailleSymbol";
import type { MistakeReason } from "./MistakeReason";
import type { PracticeMode } from "./PracticeMode";

export interface Question {
  symbol: BrailleSymbol;
  mode: PracticeMode;
}

export interface AnsweredQuestion extends Question {
  userAnswer: string;
  correct: boolean;
  latencyMs: number;
  reason: MistakeReason | "";
}
