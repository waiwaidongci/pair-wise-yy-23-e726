import { useEffect, useMemo, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { EmptyState } from "../components/common/EmptyState";
import { PracticePanel } from "../components/common/PracticePanel";
import { StatCard } from "../components/common/StatCard";
import { PracticeMode } from "../constants/PracticeMode";
import { STATUS_TEXT } from "../constants/statusText";
import { formatDate } from "../utils/formatters";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeMode as PracticeModeValue } from "../types/PracticeMode";

export function PracticePage() {
  const { rows: lessons, load: loadLessons } = useLessonStore();
  const { rows: symbols, load: loadSymbols } = useBrailleSymbolStore();
  const { load: loadSessions } = usePracticeSessionStore();
  const { load: loadRecords } = useAnswerRecordStore();
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [mode, setMode] = useState<PracticeModeValue>("CELL_TO_TEXT");

  useEffect(() => {
    loadLessons();
    loadSymbols();
  }, [loadLessons, loadSymbols]);

  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0] ?? null;

  const lessonSymbols = useMemo(() => {
    if (!lesson) return [] as BrailleSymbol[];
    const byId = new Map(symbols.map((symbol) => [symbol.id, symbol]));
    return lesson.symbol_ids
      .map((id) => byId.get(id))
      .filter((symbol): symbol is BrailleSymbol => Boolean(symbol));
  }, [lesson, symbols]);

  const practice = usePracticeSession({ lessonId: lesson?.id ?? null, symbols: lessonSymbols, mode });

  const handleNext = async () => {
    if (practice.isLast) {
      await practice.finish();
      // 练习记录已写入 IndexedDB，刷新共享 store 让错题本和进度页拿到最新数据
      await Promise.all([loadSessions(), loadRecords()]);
    } else {
      practice.next();
    }
  };

  if (!lesson) {
    return <section className="page"><EmptyState title="课程加载中" hint="正在读取本地课程数据…" /></section>;
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">practice</p>
          <h1>练习模式</h1>
        </div>
      </div>

      {practice.phase === "idle" && (
        <>
          <div className="panel">
            <h2>选择课程</h2>
            <div className="chip-row">
              {lessons.map((item) => (
                <button
                  key={item.id}
                  className={item.id === lesson.id ? "chip active" : "chip"}
                  onClick={() => setLessonId(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2>选择题型</h2>
            <div className="chip-row">
              {PracticeMode.map((value) => (
                <button
                  key={value}
                  className={mode === value ? "chip active" : "chip"}
                  onClick={() => setMode(value)}
                >
                  {STATUS_TEXT.PracticeMode[value]}
                </button>
              ))}
            </div>
          </div>
          <div className="panel practice-setup">
            <p>「{lesson.title}」共 {lessonSymbols.length} 题，{STATUS_TEXT.PracticeMode[mode]}，答完即时判定并保存记录。</p>
            <button
              type="button"
              className="btn primary"
              disabled={lessonSymbols.length === 0}
              onClick={practice.start}
            >
              开始练习
            </button>
          </div>
        </>
      )}

      {practice.phase === "running" && practice.current && (
        <PracticePanel
          question={practice.current}
          index={practice.index}
          total={practice.total}
          isLast={practice.isLast}
          lastResult={practice.lastResult}
          onSubmit={practice.submit}
          onNext={handleNext}
        />
      )}

      {practice.phase === "done" && practice.summary && (
        <>
          <div className="metrics">
            <StatCard label="本场得分" value={`${practice.summary.session.score} 分`} />
            <StatCard label="答错" value={`${practice.summary.session.mistake_count} 题`} />
            <StatCard label="完成时间" value={formatDate(practice.summary.session.finished_at)} />
          </div>
          <div className="panel">
            <h2>{practice.summary.session.mistake_count > 0 ? "错题已收入错题本" : "全部答对，太棒了！"}</h2>
            <p>{practice.summary.session.mistake_count > 0 ? "去错题本订正，连续答对即可移出待订正。" : "可以去学习进度页看看掌握情况。"}</p>
            <div className="actions">
              <button type="button" className="btn secondary" onClick={practice.reset}>再练一场</button>
              {practice.summary.session.mistake_count > 0
                ? <a className="btn primary" href="#/mistakes">去错题本订正</a>
                : <a className="btn primary" href="#/progress">查看学习进度</a>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
