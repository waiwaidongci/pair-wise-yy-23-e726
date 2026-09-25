import { useMemo } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { StatCard } from "../components/common/StatCard";
import { ChartPanel, type ChartBar } from "../components/common/ChartPanel";
import { LessonProgress as LessonProgressBar } from "../components/common/LessonProgress";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import {
  difficultyMastery,
  lessonProgress,
  overallProgress,
  scoreTrend
} from "../services/masteryService";
import { DifficultyText } from "../constants/Difficulty";
import { PracticeModeText } from "../constants/PracticeMode";
import { formatDate, formatPercent, formatLatency } from "../utils/formatters";
import { navigate } from "../router/useRoute";

export function ProgressPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const lessons = useLessonStore((s) => s.rows);
  const sessions = usePracticeSessionStore((s) => s.rows);
  const records = useAnswerRecordStore((s) => s.rows);

  const overall = useMemo(() => overallProgress(lessons, sessions, records), [lessons, sessions, records]);
  const perLesson = useMemo(
    () => lessons.map((lesson) => lessonProgress(lesson, sessions, records)),
    [lessons, sessions, records]
  );
  const difficultyStats = useMemo(() => difficultyMastery(symbols, records), [symbols, records]);
  const trend = useMemo(() => scoreTrend(sessions, 8), [sessions]);
  const recent = useMemo(() => [...sessions].sort((a, b) => b.id - a.id).slice(0, 8), [sessions]);
  const lessonTitle = useMemo(() => new Map(lessons.map((l) => [l.id, l.title])), [lessons]);

  const trendBars: ChartBar[] = trend.map((session, i) => ({
    label: `#${i + 1}`,
    value: session.score / 100,
    hint: `${session.score}分`,
    tone: session.score >= 80 ? "success" : session.score >= 60 ? "warning" : "danger"
  }));

  const difficultyBars: ChartBar[] = difficultyStats.map((stat) => ({
    label: DifficultyText[stat.difficulty],
    value: stat.accuracy,
    hint: `${stat.mastered}/${stat.total} 掌握`,
    tone: stat.accuracy >= 0.8 ? "success" : stat.accuracy >= 0.5 ? "warning" : "danger"
  }));

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="还没有练习记录"
        description="完成一次课程练习后，这里会展示课程完成率、正确率和各难度掌握情况。"
        action={
          <button type="button" className="btn btn-primary" onClick={() => navigate("/practice")}>
            开始第一次练习
          </button>
        }
      />
    );
  }

  return (
    <div className="progress-page">
      <section className="metrics">
        <StatCard label="课程完成率" value={formatPercent(overall.lessonCompletionRate * 100)} hint={`${overall.completedLessons}/${overall.totalLessons} 课达标（≥80 分）`} />
        <StatCard label="课程练习正确率" value={formatPercent(overall.accuracy * 100)} hint={`${overall.correctAnswers}/${overall.totalAnswers} 题答对`} />
        <StatCard label="练习场次" value={overall.totalSessions} hint={`含错题复习 ${overall.reviewSessions} 次`} />
        <StatCard label="点字字符总数" value={symbols.length} hint="本地已收录" />
      </section>

      <section className="workbench">
        <ChartPanel title="最近课程练习得分趋势" bars={trendBars} footer={<span className="muted">错题复习场次不计入完成率，但保留在下方记录中</span>} />
        <ChartPanel title="各难度掌握情况" bars={difficultyBars} footer={<div className="difficulty-legend">
          {difficultyStats.map((stat) => (
            <span key={stat.difficulty} className="legend-item">
              {DifficultyText[stat.difficulty]}：掌握 {stat.mastered} / 学习中 {stat.learning} / 未学 {stat.newCount}
            </span>
          ))}
        </div>} />
      </section>

      <section className="panel">
        <h2>各课程完成情况</h2>
        <div className="lesson-progress-list">
          {perLesson.map((stat) => (
            <LessonProgressBar
              key={stat.lesson.id}
              title={stat.lesson.title}
              value={stat.bestScore / 100}
              passed={stat.completed}
              detail={`最佳 ${stat.bestScore}% · 已练 ${stat.practicedSymbols}/${stat.total} 字符 · 练习 ${stat.attempted} 次`}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>最近练习记录</h2>
        <div className="table">
          <div className="table-row table-head">
            <span>时间</span>
            <span>课程</span>
            <span>模式</span>
            <span>得分</span>
            <span>错题</span>
            <span>用时</span>
          </div>
          {recent.map((session) => {
            const sessionRecords = records.filter((r) => r.session_id === session.id);
            const latency = sessionRecords.reduce((sum, r) => sum + r.latency_ms, 0);
            const isReview = session.source === "REVIEW";
            return (
              <div className="table-row" key={session.id}>
                <span>{formatDate(session.finished_at)}</span>
                <span>
                  {isReview ? "错题复习" : lessonTitle.get(session.lesson_id) ?? `课程 #${session.lesson_id}`}
                  {isReview ? <StatusBadge tone="info">复习</StatusBadge> : null}
                </span>
                <span>{PracticeModeText[session.mode]}</span>
                <span>
                  <StatusBadge tone={session.score >= 80 ? "success" : session.score >= 60 ? "warning" : "danger"}>
                    {session.score} 分
                  </StatusBadge>
                </span>
                <span>{session.mistake_count}/{session.total_count}</span>
                <span>{formatLatency(latency)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
