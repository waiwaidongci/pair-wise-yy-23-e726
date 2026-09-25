import { useEffect, useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { BrailleCell } from "../components/common/BrailleCell";
import { EmptyState } from "../components/common/EmptyState";
import { LessonProgress } from "../components/common/LessonProgress";
import { StatusBadge } from "../components/common/StatusBadge";
import { lessonProgressOf } from "../services/LessonService";
import { Difficulty } from "../constants/Difficulty";
import { STATUS_TEXT } from "../constants/statusText";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Difficulty as DifficultyValue } from "../types/Difficulty";

export function LearnPage() {
  const { rows: symbols, load: loadSymbols } = useBrailleSymbolStore();
  const { rows: lessons, load: loadLessons } = useLessonStore();
  const { rows: sessions, load: loadSessions } = usePracticeSessionStore();
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyValue | "ALL">("ALL");

  useEffect(() => {
    loadSymbols();
    loadLessons();
    loadSessions();
  }, [loadSymbols, loadLessons, loadSessions]);

  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0] ?? null;

  const lessonSymbols = useMemo(() => {
    if (!lesson) return [] as BrailleSymbol[];
    const byId = new Map(symbols.map((symbol) => [symbol.id, symbol]));
    return lesson.symbol_ids
      .map((id) => byId.get(id))
      .filter((symbol): symbol is BrailleSymbol => Boolean(symbol));
  }, [lesson, symbols]);

  const visible = difficulty === "ALL" ? lessonSymbols : lessonSymbols.filter((symbol) => symbol.difficulty === difficulty);
  const progress = lesson ? lessonProgressOf(lesson, sessions) : null;

  if (!lesson) {
    return <section className="page"><EmptyState title="课程加载中" hint="正在读取本地点字数据…" /></section>;
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">learn</p>
          <h1>学习卡片</h1>
        </div>
        <StatusBadge value={lesson.stage} />
      </div>

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

      <div className="panel">
        <LessonProgress
          title={lesson.title}
          percent={progress?.percent ?? 0}
          detail={`${lesson.symbol_ids.length} 个字符 · 约 ${lesson.estimated_minutes} 分钟 · ${lesson.unlock_rule}`}
        />
      </div>

      <div className="chip-row">
        <button className={difficulty === "ALL" ? "chip active" : "chip"} onClick={() => setDifficulty("ALL")}>全部难度</button>
        {Difficulty.map((value) => (
          <button
            key={value}
            className={difficulty === value ? "chip active" : "chip"}
            onClick={() => setDifficulty(value)}
          >
            {STATUS_TEXT.Difficulty[value]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="该难度下暂无字符" hint="切换难度或课程看看" />
      ) : (
        <div className="card-grid">
          {visible.map((symbol) => (
            <article key={symbol.id} className="symbol-card">
              <BrailleCell pattern={symbol.cell_pattern} />
              <strong className="symbol-letter">{symbol.letter}</strong>
              <span className="symbol-pinyin">{symbol.pinyin}</span>
              <div className="symbol-badges">
                <StatusBadge value={STATUS_TEXT.SymbolCategory[symbol.category]} />
                <StatusBadge value={STATUS_TEXT.Difficulty[symbol.difficulty]} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
