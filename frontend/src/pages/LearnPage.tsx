import { useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBraillePattern } from "../hooks/useBraillePattern";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatusBadge, type BadgeTone } from "../components/common/StatusBadge";
import { LessonProgress as LessonProgressBar } from "../components/common/LessonProgress";
import { EmptyState } from "../components/common/EmptyState";
import { Difficulty, DifficultyText, type Difficulty as DifficultyType } from "../constants/Difficulty";
import { SymbolCategoryText } from "../constants/SymbolCategory";
import { lessonProgress } from "../services/masteryService";
import { navigate } from "../router/useRoute";
import { formatPattern } from "../utils/formatters";

type DifficultyFilter = "ALL" | DifficultyType;

const DIFFICULTY_TONE: Record<DifficultyType, BadgeTone> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger"
};

export function LearnPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const lessons = useLessonStore((s) => s.rows);
  const sessions = usePracticeSessionStore((s) => s.rows);
  const records = useAnswerRecordStore((s) => s.rows);

  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [lessonId, setLessonId] = useState<number>(lessons[0]?.id ?? 0);
  const selectedLesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];

  const lessonSymbols = useMemo(() => {
    if (!selectedLesson) return [];
    return selectedLesson.symbol_ids
      .map((id) => symbols.find((s) => s.id === id))
      .filter((s): s is (typeof symbols)[number] => Boolean(s));
  }, [selectedLesson, symbols]);

  const visibleSymbols = useMemo(
    () => (difficulty === "ALL" ? lessonSymbols : lessonSymbols.filter((s) => s.difficulty === difficulty)),
    [lessonSymbols, difficulty]
  );

  const pager = useBraillePattern(visibleSymbols, 6);
  const progress = selectedLesson ? lessonProgress(selectedLesson, sessions, records) : null;

  if (lessons.length === 0) {
    return <EmptyState title="课程数据加载中" description="首次打开正在写入本地点字数据，请稍候。" />;
  }

  return (
    <div className="learn-page">
      <div className="toolbar panel">
        <label className="field">
          <span>选择课程</span>
          <select value={selectedLesson?.id ?? 0} onChange={(e) => setLessonId(Number(e.target.value))}>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </label>
        <div className="segmented" role="group" aria-label="按难度切换">
          {(["ALL", ...Difficulty] as DifficultyFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={difficulty === value ? "seg active" : "seg"}
              onClick={() => {
                pager.setPage(1);
                setDifficulty(value);
              }}
            >
              {value === "ALL" ? "全部" : DifficultyText[value]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(`/practice?lesson=${selectedLesson?.id ?? 0}`)}
        >
          练习本课 →
        </button>
      </div>

      {progress && selectedLesson ? (
        <div className="panel">
          <LessonProgressBar
            title={`${selectedLesson.title} · 最佳成绩`}
            value={progress.bestScore / 100}
            passed={progress.completed}
            detail={`最佳 ${progress.bestScore}% · 已练 ${progress.practicedSymbols}/${progress.total} 字符`}
          />
        </div>
      ) : null}

      {visibleSymbols.length === 0 ? (
        <EmptyState title="当前难度下没有卡片" description="切换难度筛选，或直接进入本课练习。" />
      ) : (
        <div className="card-grid">
          {pager.pageRows.map((symbol) => (
            <article key={symbol.id} className="panel symbol-card">
              <div className="symbol-card-head">
                <StatusBadge tone={DIFFICULTY_TONE[symbol.difficulty]}>{DifficultyText[symbol.difficulty]}</StatusBadge>
                <span className="muted">{SymbolCategoryText[symbol.category]}</span>
              </div>
              <div className="symbol-card-body">
                <BrailleCell pattern={symbol.cell_pattern} size="md" />
                <div className="symbol-meta">
                  <strong className="symbol-letter">{symbol.letter}</strong>
                  <span className="muted">{symbol.pinyin}</span>
                  <span className="muted">点位 {formatPattern(symbol.cell_pattern)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pager">
        <button type="button" className="btn" disabled={pager.page <= 1} onClick={pager.prev}>
          上一页
        </button>
        <span>
          {pager.page} / {pager.totalPages}
        </span>
        <button type="button" className="btn" disabled={pager.page >= pager.totalPages} onClick={pager.next}>
          下一页
        </button>
      </div>
    </div>
  );
}
