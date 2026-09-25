import { useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { BrailleCell } from "../components/common/BrailleCell";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { QuizRunner } from "../components/common/QuizRunner";
import { listAnswerRecord, markAnswerRecordResolved } from "../api/AnswerRecord";
import {
  ALL_MISTAKE_REASONS,
  groupPendingMistakes,
  pendingMistakeSymbols,
  submitReview,
  type PendingMistake
} from "../services/mistakesService";
import { MistakeReasonText, type MistakeReason } from "../constants/MistakeReason";
import type { QuizAnswer } from "../services/quizService";
import { formatPattern } from "../utils/formatters";
import { navigate } from "../router/useRoute";

type ReviewTarget = { mode: "ALL" } | { mode: "REASON"; reason: MistakeReason } | { mode: "SYMBOL"; symbolId: number } | null;

export function MistakesPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const records = useAnswerRecordStore((s) => s.rows);
  const replaceRecords = useAnswerRecordStore((s) => s.replace);
  const [target, setTarget] = useState<ReviewTarget>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const grouped = useMemo(() => groupPendingMistakes(records, symbols), [records, symbols]);
  const pendingList = useMemo<PendingMistake[]>(
    () => ALL_MISTAKE_REASONS.flatMap((reason) => grouped.get(reason) ?? []),
    [grouped]
  );
  const pendingSymbols = useMemo(() => pendingMistakeSymbols(records, symbols), [records, symbols]);

  const refreshRecords = async () => {
    replaceRecords(await listAnswerRecord());
  };

  const targetSymbols = useMemo(() => {
    if (!target) return [];
    if (target.mode === "ALL") return pendingSymbols;
    if (target.mode === "REASON") return (grouped.get(target.reason) ?? []).map((item) => item.symbol);
    return symbols.filter((s) => s.id === target.symbolId);
  }, [target, pendingSymbols, grouped, symbols]);

  const handleReviewComplete = async (answers: QuizAnswer[]): Promise<number> => {
    // 复习范围对应的全部待订正记录（决定哪些会被移走）
    const targetIds = new Set(targetSymbols.map((s) => s.id));
    const scopedPending = records.filter(
      (r) => !r.resolved && !r.correct && r.mistake_reason && targetIds.has(r.symbol_id)
    );
    const result = await submitReview(answers, scopedPending);
    await refreshRecords();
    setNotice(
      result.passed
        ? `复习达标（${result.score} 分），${result.resolvedCount} 条错题已移出错题本；本次练习进度已保留。`
        : `本次 ${result.score} 分，未达到 80 分订正线，错题保留，可继续复习。`
    );
    // 停在结算页，学员点击“返回错题本”后再退出复习
    return result.score;
  };

  const markMastered = async (item: PendingMistake) => {
    const related = records.filter((r) => r.symbol_id === item.symbol.id && !r.resolved && !r.correct);
    await Promise.all(related.map((record) => markAnswerRecordResolved(record)));
    await refreshRecords();
    setNotice(`「${item.symbol.letter}」已标记掌握，从待订正列表移走。`);
  };

  // 复习作答中
  if (target && targetSymbols.length > 0) {
    return (
      <QuizRunner
        symbols={targetSymbols}
        mode="MIXED"
        timeoutMs={20_000}
        onComplete={handleReviewComplete}
        onExit={() => setTarget(null)}
        summaryPrimary={{ label: "返回错题本", onClick: () => setTarget(null) }}
      />
    );
  }

  if (pendingList.length === 0) {
    return (
      <>
        {notice ? <div className="panel notice">{notice}</div> : null}
        <EmptyState
          title="错题本是空的 🎉"
          description="练习中答错的字符会按原因进入这里，复习达标后自动移走。"
          action={
            <button type="button" className="btn btn-primary" onClick={() => navigate("/practice")}>
              去练习
            </button>
          }
        />
      </>
    );
  }

  return (
    <div className="mistakes-page">
      {notice ? <div className="panel notice">{notice}</div> : null}
      <div className="panel mistakes-head">
        <div>
          <h2>待订正错题</h2>
          <p className="muted">
            共 {pendingList.length} 个字符需要订正；复习达到 80 分即从列表移走，但这次练习记录仍保留在进度页。
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setTarget({ mode: "ALL" })}>
          开始全部复习（{pendingSymbols.length} 字）
        </button>
      </div>

      {ALL_MISTAKE_REASONS.map((reason) => {
        const items = grouped.get(reason) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={reason} className="panel mistake-group">
            <div className="mistake-group-head">
              <h2>
                {MistakeReasonText[reason]} <span className="muted">（{items.length}）</span>
              </h2>
              <button type="button" className="btn" onClick={() => setTarget({ mode: "REASON", reason })}>
                复习本组
              </button>
            </div>
            <ul className="mistake-list">
              {items.map((item) => (
                <li key={item.record.id} className="mistake-item">
                  <BrailleCell pattern={item.symbol.cell_pattern} size="sm" />
                  <div className="mistake-meta">
                    <strong>{item.symbol.letter}</strong>
                    <span className="muted">{item.symbol.pinyin}</span>
                    <span className="muted">点位 {formatPattern(item.symbol.cell_pattern)}</span>
                    <StatusBadge tone="danger">错 {item.mistakeCount} 次</StatusBadge>
                  </div>
                  <div className="mistake-actions">
                    <button type="button" className="btn" onClick={() => setTarget({ mode: "SYMBOL", symbolId: item.symbol.id })}>
                      针对性复习
                    </button>
                    <button type="button" className="btn" onClick={() => void markMastered(item)}>
                      标记掌握
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
