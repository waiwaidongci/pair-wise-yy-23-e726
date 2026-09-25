import { useEffect, useMemo } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { ChartPanel } from "../components/common/ChartPanel";
import { EmptyState } from "../components/common/EmptyState";
import { LessonProgress } from "../components/common/LessonProgress";
import { StatCard } from "../components/common/StatCard";
import { lessonCompletionRate, lessonProgressOf } from "../services/LessonService";
import { listPendingMistakes } from "../services/MistakeService";
import { difficultyBreakdown, overallAccuracy } from "../services/ProgressService";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { STATUS_TEXT } from "../constants/statusText";
import { clearAll, ensureSeeded } from "../utils/localDb";

export function ProgressPage() {
  const { rows: lessons, load: loadLessons } = useLessonStore();
  const { rows: symbols, load: loadSymbols } = useBrailleSymbolStore();
  const { rows: sessions, load: loadSessions } = usePracticeSessionStore();
  const { rows: records, load: loadRecords } = useAnswerRecordStore();

  useEffect(() => {
    loadLessons();
    loadSymbols();
    loadSessions();
    loadRecords();
  }, [loadLessons, loadSymbols, loadSessions, loadRecords]);

  const completion = useMemo(() => lessonCompletionRate(lessons, sessions), [lessons, sessions]);
  const accuracy = useMemo(() => overallAccuracy(records), [records]);
  const pendingCount = useMemo(() => listPendingMistakes(records, symbols).length, [records, symbols]);
  const difficultyStats = useMemo(() => difficultyBreakdown(symbols, records), [symbols, records]);
  const lessonTitleById = useMemo(() => new Map(lessons.map((lesson) => [lesson.id, lesson.title])), [lessons]);
  const recentSessions = useMemo(() => [...sessions].sort((a, b) => b.id - a.id).slice(0, 8).reverse(), [sessions]);

  const handleReset = async () => {
    if (!window.confirm("确定要清空本地练习数据吗？课程和点字会恢复到初始状态。")) return;
    await clearAll();
    await ensureSeeded();
    await Promise.all([loadSymbols(), loadLessons(), loadSessions(), loadRecords()]);
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">progress</p>
          <h1>学习进度</h1>
        </div>
        <button type="button" className="btn danger" onClick={handleReset}>重置本地数据</button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title="还没有练习记录" hint="去练习模式完成第一次练习，这里会统计完成率、正确率和难度掌握情况" />
      ) : (
        <div className="metrics">
          <StatCard label="课程完成率" value={`${completion.percent}%（${completion.done}/${completion.total}）`} />
          <StatCard label="总体正确率" value={`${accuracy}%`} />
          <StatCard label="练习场次" value={sessions.length} />
          <StatCard label="待订正错题" value={pendingCount} />
        </div>
      )}

      <div className="panel">
        <h2>课程完成情况</h2>
        {lessons.map((lesson) => {
          const info = lessonProgressOf(lesson, sessions);
          return (
            <LessonProgress
              key={lesson.id}
              title={lesson.title}
              percent={info.percent}
              detail={`最好成绩 ${info.bestScore} 分 · 已练习 ${info.attempts} 次 · ${info.done ? "已完成" : "未达标"}`}
            />
          );
        })}
      </div>

      <div className="workbench-grid">
        <ChartPanel
          title="各难度掌握情况"
          items={difficultyStats.map((stat) => ({
            label: STATUS_TEXT.Difficulty[stat.difficulty],
            percent: stat.masteredPercent,
            detail: `${MasteryLevelText.MASTERED} ${stat.byMastery.MASTERED}/${stat.total} · 正确率 ${stat.accuracy}%`
          }))}
        />
        <ChartPanel
          title="最近练习得分"
          items={recentSessions.map((session) => ({
            label: session.lesson_id === null ? `#${session.id} 错题订正` : `#${session.id} ${lessonTitleById.get(session.lesson_id) ?? "已删除课程"}`,
            percent: session.score,
            detail: `${session.score} 分`
          }))}
        />
      </div>

      <div className="panel">
        <h2>难度分布明细</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>难度</th>
                <th>{MasteryLevelText.NEW}</th>
                <th>{MasteryLevelText.LEARNING}</th>
                <th>{MasteryLevelText.FAMILIAR}</th>
                <th>{MasteryLevelText.MASTERED}</th>
                <th>正确率</th>
              </tr>
            </thead>
            <tbody>
              {difficultyStats.map((stat) => (
                <tr key={stat.difficulty}>
                  <td>{STATUS_TEXT.Difficulty[stat.difficulty]}</td>
                  <td>{stat.byMastery.NEW}</td>
                  <td>{stat.byMastery.LEARNING}</td>
                  <td>{stat.byMastery.FAMILIAR}</td>
                  <td>{stat.byMastery.MASTERED}</td>
                  <td>{stat.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
