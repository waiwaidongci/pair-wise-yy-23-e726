import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnswerRecord } from "../types/AnswerRecord";

/**
 * 标准盲文 6 点制种子数据。
 * 点位编号布局：
 *   1  4
 *   2  5
 *   3  6
 * 数字使用与 a-j 相同的点位（数字符号引导），这里作为独立练习字符收录。
 */
export const seedBrailleSymbols: BrailleSymbol[] = [
  // ---- 字母 a-j（简单）----
  { id: 1, cell_pattern: [1], letter: "a", pinyin: "诶", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:a" },
  { id: 2, cell_pattern: [1, 2], letter: "b", pinyin: "必", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:b" },
  { id: 3, cell_pattern: [1, 4], letter: "c", pinyin: "西", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:c" },
  { id: 4, cell_pattern: [1, 4, 5], letter: "d", pinyin: "迪", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:d" },
  { id: 5, cell_pattern: [1, 5], letter: "e", pinyin: "伊", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:e" },
  { id: 6, cell_pattern: [1, 2, 4], letter: "f", pinyin: "艾弗", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:f" },
  { id: 7, cell_pattern: [1, 2, 4, 5], letter: "g", pinyin: "吉", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:g" },
  { id: 8, cell_pattern: [1, 2, 5], letter: "h", pinyin: "艾尺", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:h" },
  { id: 9, cell_pattern: [2, 4], letter: "i", pinyin: "艾", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:i" },
  { id: 10, cell_pattern: [2, 4, 5], letter: "j", pinyin: "杰", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:j" },
  // ---- 字母 k-t（中等）----
  { id: 11, cell_pattern: [1, 3], letter: "k", pinyin: "凯", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:k" },
  { id: 12, cell_pattern: [1, 2, 3], letter: "l", pinyin: "艾尔", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:l" },
  { id: 13, cell_pattern: [1, 3, 4], letter: "m", pinyin: "艾姆", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:m" },
  { id: 14, cell_pattern: [1, 3, 4, 5], letter: "n", pinyin: "恩", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:n" },
  { id: 15, cell_pattern: [1, 3, 5], letter: "o", pinyin: "欧", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:o" },
  { id: 16, cell_pattern: [1, 2, 3, 4], letter: "p", pinyin: "屁", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:p" },
  { id: 17, cell_pattern: [1, 2, 3, 4, 5], letter: "q", pinyin: "丘", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:q" },
  { id: 18, cell_pattern: [1, 2, 3, 5], letter: "r", pinyin: "啊尔", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:r" },
  { id: 19, cell_pattern: [2, 3, 4], letter: "s", pinyin: "艾斯", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:s" },
  { id: 20, cell_pattern: [2, 3, 4, 5], letter: "t", pinyin: "踢", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:t" },
  // ---- 字母 u-z（困难，含下点位 6）----
  { id: 21, cell_pattern: [1, 3, 6], letter: "u", pinyin: "优", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:u" },
  { id: 22, cell_pattern: [1, 2, 3, 6], letter: "v", pinyin: "维", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:v" },
  { id: 23, cell_pattern: [2, 4, 5, 6], letter: "w", pinyin: "达布尔尤", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:w" },
  { id: 24, cell_pattern: [1, 3, 4, 6], letter: "x", pinyin: "艾克斯", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:x" },
  { id: 25, cell_pattern: [1, 3, 4, 5, 6], letter: "y", pinyin: "歪", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:y" },
  { id: 26, cell_pattern: [1, 3, 5, 6], letter: "z", pinyin: "贼德", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:z" },
  // ---- 数字（与 a-j 同点位，简单）----
  { id: 101, cell_pattern: [1], letter: "1", pinyin: "一", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:1" },
  { id: 102, cell_pattern: [1, 2], letter: "2", pinyin: "二", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:2" },
  { id: 103, cell_pattern: [1, 4], letter: "3", pinyin: "三", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:3" },
  { id: 104, cell_pattern: [1, 4, 5], letter: "4", pinyin: "四", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:4" },
  { id: 105, cell_pattern: [1, 5], letter: "5", pinyin: "五", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:5" },
  { id: 106, cell_pattern: [1, 2, 4], letter: "6", pinyin: "六", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:6" },
  { id: 107, cell_pattern: [1, 2, 4, 5], letter: "7", pinyin: "七", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:7" },
  { id: 108, cell_pattern: [1, 2, 5], letter: "8", pinyin: "八", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:8" },
  { id: 109, cell_pattern: [2, 4], letter: "9", pinyin: "九", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:9" },
  { id: 110, cell_pattern: [2, 4, 5], letter: "0", pinyin: "零", category: "NUMBER", difficulty: "EASY", audio_hint_key: "number:0" },
  // ---- 常用标点（中等）----
  { id: 201, cell_pattern: [2], letter: "，", pinyin: "逗号", category: "PUNCTUATION", difficulty: "MEDIUM", audio_hint_key: "punct:comma" },
  { id: 202, cell_pattern: [2, 3], letter: "；", pinyin: "分号", category: "PUNCTUATION", difficulty: "MEDIUM", audio_hint_key: "punct:semicolon" },
  { id: 203, cell_pattern: [2, 5], letter: "。", pinyin: "句号", category: "PUNCTUATION", difficulty: "MEDIUM", audio_hint_key: "punct:period" },
  { id: 204, cell_pattern: [2, 3, 5], letter: "！", pinyin: "感叹号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:exclaim" },
  { id: 205, cell_pattern: [2, 3, 6], letter: "？", pinyin: "问号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:question" },
  { id: 206, cell_pattern: [2, 3, 5, 6], letter: "（）", pinyin: "括号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:paren" },
  // ---- 常用简写符（困难）----
  { id: 301, cell_pattern: [1, 2, 3, 4, 5, 6], letter: "for", pinyin: "for", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:for" },
  { id: 302, cell_pattern: [1, 2, 3, 5, 6], letter: "the", pinyin: "the", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:the" },
  { id: 303, cell_pattern: [1, 2, 5, 6], letter: "with", pinyin: "with", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:with" },
  { id: 304, cell_pattern: [1, 4, 5, 6], letter: "and", pinyin: "and", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:and" }
];

export const seedLessons: Lesson[] = [
  {
    id: 1,
    title: "第一课：基础点位 a–e",
    symbol_ids: [1, 2, 3, 4, 5],
    stage: "入门",
    estimated_minutes: 10,
    unlock_rule: "默认开放"
  },
  {
    id: 2,
    title: "第二课：f–j 与数字 1–5",
    symbol_ids: [6, 7, 8, 9, 10, 101, 102, 103, 104, 105],
    stage: "入门",
    estimated_minutes: 15,
    unlock_rule: "完成第一课练习"
  },
  {
    id: 3,
    title: "第三课：k–o",
    symbol_ids: [11, 12, 13, 14, 15],
    stage: "进阶",
    estimated_minutes: 12,
    unlock_rule: "完成第二课练习"
  },
  {
    id: 4,
    title: "第四课：p–t 与数字 6–0",
    symbol_ids: [16, 17, 18, 19, 20, 106, 107, 108, 109, 110],
    stage: "进阶",
    estimated_minutes: 15,
    unlock_rule: "完成第三课练习"
  },
  {
    id: 5,
    title: "第五课：u–z（下点位）",
    symbol_ids: [21, 22, 23, 24, 25, 26],
    stage: "提高",
    estimated_minutes: 12,
    unlock_rule: "完成第四课练习"
  },
  {
    id: 6,
    title: "第六课：标点符号",
    symbol_ids: [201, 202, 203, 204, 205, 206],
    stage: "提高",
    estimated_minutes: 10,
    unlock_rule: "完成第五课练习"
  },
  {
    id: 7,
    title: "第七课：常用简写符",
    symbol_ids: [301, 302, 303, 304],
    stage: "挑战",
    estimated_minutes: 8,
    unlock_rule: "完成第六课练习"
  }
];

/** 用户练习数据初始为空，全部来自本地练习累积 */
export const seedPracticeSessions: PracticeSession[] = [];
export const seedAnswerRecords: AnswerRecord[] = [];

/**
 * 兼容旧引用（main.tsx 等历史占位代码）的聚合导出。
 * 业务代码请直接使用上面的具名导出。
 */
export const mockData = {
  brailleSymbol: seedBrailleSymbols,
  lesson: seedLessons,
  practiceSession: seedPracticeSessions,
  answerRecord: seedAnswerRecords
};
