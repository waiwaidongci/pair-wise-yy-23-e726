import { useEffect, useMemo, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { BrailleCell } from "../components/common/BrailleCell";
import { EmptyState } from "../components/common/EmptyState";
import { PracticePanel } from "../components/common/PracticePanel";
import { StatCard } from "../components/common/StatCard";
import { groupByReason, listPendingMistakes } from "../services/MistakeService";
import { MISTAKE_CLEAR_STREAK } from "../constants/practiceRules";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { STATUS_TEXT } from "../constants/statusText";
import type { BrailleSymbol } from "../types/BrailleSymbol";

export function MistakesPage() {
  const { rows: records, load: loadRecords } = useAnswerRecordStore();
  const { rows: symbols, load: loadSymbols } = useBrailleSymbolStore();
  const { load: loadSessions } = usePracticeSessionStore();
  const [beforeCount, setBeforeCount] = useState(0);

  useEffect(() => {
    loadRecords();
    loadSymbols();
  }, [loadRecords, loadSymbols]);

  const pending = useMemo(() => listPendingMistakes(records, symbols), [records, symbols]);
  const groups = useMemo(() => groupByReason(pending), [pending]);
  const reviewSymbols = useMemo(() => pending.map((item) => item.symbol), [pending]) as BrailleSymbol[];
  const review = usePracticeSession({ lessonId: null, symbols: reviewSymbols, mode: "MIXED" });

  const handleNext = async () => {
    if (review.isLast) {
      setBeforeCount(pending.length);
      await review.finish();
      await Promise.all([loadRecords(), loadSessions()]);
    } else {
      review.next();
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">mistakes</p>
          <h1>错题本</h1>
        </div>
        {review.phase !== "running" && <span className="badge">待订正 {pending.length}</span>}
      </div>

      {review.phase === "running" && review.current && (
        <PracticePanel
          question={review.current}
          index={review.index}
          total={review.total}
          isLast={review.isLast}
          lastResult={review.lastResult}
          onSubmit={review.submit}
          onNext={handleNext}
        />
      )}

      {review.phase === "done" && review.summary && (() => {
        const cleared = beforeCount - pending.length;
        if (cleared > 0) console.info(LOG_TEMPLATES.MistakeReview[1], cleared);
        if (pending.length > 0) console.info(LOG_TEMPLATES.MistakeReview[2], pending.length);
        return (
          <>
            <div className="metrics">
              <StatCard label="订正得分" value={`${review.summary.session.score} 分`} />
              <StatCard label="达标移出" value={`${Math.max(0, cleared)} 个`} />
              <StatCard label="仍待订正" value={`${pending.length} 个`} />
            </div>
            <div className="panel">
              <h2>{pending.length === 0 ? "待订正列表已清空" : "继续加油"}</h2>
              <p>连续答对 {MISTAKE_CLEAR_STREAK} 次的字符已移出待订正列表，本次练习进度仍保留在学习进度页。</p>
              <div className="actions">
                <button type="button" className="btn secondary" onClick={review.reset}>返回错题本</button>
                <a className="btn primary" href="#/progress">查看学习进度</a>
              </div>
            </div>
          </>
        );
      })()}

      {review.phase === "idle" && (
        <>
          {pending.length === 0 ? (
            <EmptyState title="错题本已清空" hint="去练习模式完成一场练习，答错的字符会按原因收录到这里" />
          ) : (
            <>
              <div className="panel practice-setup">
                <p>共 {pending.length} 个字符待订正，混合出题；连续答对 {MISTAKE_CLEAR_STREAK} 次即达标移出。</p>
                <button type="button" className="btn primary" onClick={review.start}>开始订正练习</button>
              </div>
              {groups.map(([reason, items]) => (
                <div className="panel" key={reason}>
                  <h2>{STATUS_TEXT.MistakeReason[reason]}（{items.length}）</h2>
                  {items.map((item) => (
                    <div className="mistake-row" key={item.symbol.id}>
                      <BrailleCell pattern={item.symbol.cell_pattern} size="sm" label={item.symbol.letter} />
                      <div className="mistake-meta">
                        <strong>{item.symbol.letter} · {item.symbol.pinyin}</strong>
                        <small>答错 {item.wrongCount} 次 · 当前连续答对 {item.reviewStreak}/{MISTAKE_CLEAR_STREAK}</small>
                      </div>
                      <span className="badge">{STATUS_TEXT.MistakeReason[reason]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
