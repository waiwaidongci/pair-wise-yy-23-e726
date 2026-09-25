import { LESSON_PASS_SCORE } from "../constants/practiceRules";
import type { Lesson } from "../types/Lesson";
import type { PracticeSession } from "../types/PracticeSession";

export interface LessonProgressInfo {
  lesson: Lesson;
  attempts: number;
  bestScore: number;
  done: boolean;
  percent: number;
}

// 课程完成 = 至少一场该课程练习得分达到 LESSON_PASS_SCORE；未达标按最好成绩折算进度
export function lessonProgressOf(lesson: Lesson, sessions: PracticeSession[]): LessonProgressInfo {
  const mine = sessions.filter((session) => session.lesson_id === lesson.id && session.finished_at);
  const bestScore = mine.reduce((max, session) => Math.max(max, session.score), 0);
  const done = bestScore >= LESSON_PASS_SCORE;
  return {
    lesson,
    attempts: mine.length,
    bestScore,
    done,
    percent: done ? 100 : Math.min(99, Math.round((bestScore / LESSON_PASS_SCORE) * 100))
  };
}

export function lessonCompletionRate(lessons: Lesson[], sessions: PracticeSession[]): { done: number; total: number; percent: number } {
  const total = lessons.length;
  const done = lessons.filter((lesson) => lessonProgressOf(lesson, sessions).done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
