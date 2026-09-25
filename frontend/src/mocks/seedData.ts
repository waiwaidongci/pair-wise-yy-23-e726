import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";
import type { PracticeSession } from "../types/PracticeSession";

// cell_pattern 为 6 位 0/1 字符串，依次对应盲文 1-6 号点（左列 1-3，右列 4-6）
// 字母采用国际通用盲文点位，拼音为现行盲文呼读音
const LETTER_CELLS: Array<[letter: string, cell: string, pinyin: string]> = [
  ["a", "100000", "ā"],
  ["b", "110000", "bō"],
  ["c", "100100", "cī"],
  ["d", "100110", "dē"],
  ["e", "100010", "é"],
  ["f", "110100", "fó"],
  ["g", "110110", "gē"],
  ["h", "110010", "hē"],
  ["i", "010100", "yī"],
  ["j", "010110", "jī"],
  ["k", "101000", "kē"],
  ["l", "111000", "lē"],
  ["m", "101100", "mó"],
  ["n", "101110", "nē"],
  ["o", "101010", "ō"],
  ["p", "111100", "pō"],
  ["q", "111110", "qī"],
  ["r", "111010", "rì"],
  ["s", "011100", "sī"],
  ["t", "011110", "tē"],
  ["u", "101001", "wū"],
  ["v", "111001", "yū"],
  ["w", "010111", "wā"],
  ["x", "101101", "xī"],
  ["y", "101111", "yā"],
  ["z", "101011", "zī"]
];

// 数字需先写数号（3456 点），本体沿用 a-j 点位
const NUMBER_CELLS: Array<[digit: string, cell: string, pinyin: string]> = [
  ["1", "100000", "yī"],
  ["2", "110000", "èr"],
  ["3", "100100", "sān"],
  ["4", "100110", "sì"],
  ["5", "100010", "wǔ"],
  ["6", "110100", "liù"],
  ["7", "110110", "qī"],
  ["8", "110010", "bā"],
  ["9", "010100", "jiǔ"],
  ["0", "010110", "líng"]
];

const PUNCTUATION_CELLS: Array<[mark: string, cell: string, pinyin: string]> = [
  ["，", "011000", "dòu hào"],
  ["。", "011011", "jù hào"],
  ["？", "010001", "yí wèn hào"],
  ["！", "011010", "gǎn tàn hào"],
  ["、", "000110", "dùn hào"]
];

// 现行盲文高频简写：的/了借用 d/l 点位，er 为六点满格
const CONTRACTION_CELLS: Array<[word: string, cell: string, pinyin: string]> = [
  ["的", "100110", "de"],
  ["了", "111000", "le"],
  ["er", "111111", "ér"]
];

const letters: BrailleSymbol[] = LETTER_CELLS.map(([letter, cell, pinyin], index) => ({
  id: index + 1,
  cell_pattern: cell,
  letter,
  pinyin,
  category: "LETTER",
  difficulty: index < 10 ? "EASY" : index < 20 ? "MEDIUM" : "HARD",
  audio_hint_key: `hint/letter/${letter}`
}));

const numbers: BrailleSymbol[] = NUMBER_CELLS.map(([digit, cell, pinyin], index) => ({
  id: 27 + index,
  cell_pattern: cell,
  letter: digit,
  pinyin,
  category: "NUMBER",
  difficulty: "HARD",
  audio_hint_key: `hint/number/${digit}`
}));

const punctuations: BrailleSymbol[] = PUNCTUATION_CELLS.map(([mark, cell, pinyin], index) => ({
  id: 37 + index,
  cell_pattern: cell,
  letter: mark,
  pinyin,
  category: "PUNCTUATION",
  difficulty: "HARD",
  audio_hint_key: `hint/punctuation/${index + 1}`
}));

const contractions: BrailleSymbol[] = CONTRACTION_CELLS.map(([word, cell, pinyin], index) => ({
  id: 42 + index,
  cell_pattern: cell,
  letter: word,
  pinyin,
  category: "CONTRACTION",
  difficulty: "MEDIUM",
  audio_hint_key: `hint/contraction/${index + 1}`
}));

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const lessons: Lesson[] = [
  { id: 1, title: "字母入门 A–J", symbol_ids: range(1, 10), stage: "基础", estimated_minutes: 10, unlock_rule: "默认解锁" },
  { id: 2, title: "字母进阶 K–T", symbol_ids: range(11, 20), stage: "基础", estimated_minutes: 12, unlock_rule: "建议完成「字母入门 A–J」后学习" },
  { id: 3, title: "字母提高 U–Z", symbol_ids: range(21, 26), stage: "进阶", estimated_minutes: 8, unlock_rule: "建议完成「字母进阶 K–T」后学习" },
  { id: 4, title: "数字 0–9", symbol_ids: range(27, 36), stage: "进阶", estimated_minutes: 10, unlock_rule: "建议完成「字母入门 A–J」后学习" },
  { id: 5, title: "常用标点", symbol_ids: range(37, 41), stage: "应用", estimated_minutes: 6, unlock_rule: "建议完成「字母提高 U–Z」后学习" },
  { id: 6, title: "高频简写", symbol_ids: range(42, 44), stage: "应用", estimated_minutes: 5, unlock_rule: "建议完成「常用标点」后学习" }
];

export const mockData: {
  brailleSymbol: BrailleSymbol[];
  lesson: Lesson[];
  practiceSession: PracticeSession[];
  answerRecord: AnswerRecord[];
} = {
  brailleSymbol: [...letters, ...numbers, ...punctuations, ...contractions],
  lesson: lessons,
  practiceSession: [],
  answerRecord: []
};
