import { useMemo, useRef, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { EmptyState } from "../components/common/EmptyState";
import { QuizRunner } from "../components/common/QuizRunner";
import { submitQuizSession, type QuizAnswer } from "../services/quizService";
import { PracticeMode, PracticeModeText, type PracticeMode as PracticeModeType } from "../constants/PracticeMode";
import { navigate } from "../router/useRoute";

interface PracticePageProps {
  initialLessonId?: number;
}

const TIMEOUT_MS = 20_000;

export function PracticePage({ initialLessonId }: PracticePageProps) {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const lessons = useLessonStore((s) => s.rows);
  const appendSession = usePracticeSessionStore((s) => s.append);
  const appendRecords = useAnswerRecordStore((s) => s.appendMany);

  const [lessonId, setLessonId] = useState<number>(initialLessonId ?? 0);
  const [mode, setMode] = useState<PracticeModeType>("CELL_TO_TEXT");
  const [timed, setTimed] = useState(false);
  const [running, setRunning] = useState(false);
  const [lastWrongCount, setLastWrongCount] = useState<number>(0);
  const startedAtRef = useRef<string>(new Date().toISOString());

  const effectiveLessonId = lessonId || initialLessonId || lessons[0]?.id || 0;
  const lesson = lessons.find((l) => l.id === effectiveLessonId);
  const lessonSymbols = useMemo(
    () => symbols.filter((s) => lesson?.symbol_ids.includes(s.id)),
    [symbols, lesson]
  );

  const start = () => {
    if (!lesson || lessonSymbols.length === 0) return;
    startedAtRef.current = new Date().toISOString();
    setRunning(true);
  };

  const handleComplete = async (answers: QuizAnswer[]): Promise<number> => {
    if (!lesson) return 0;
    const { session, records } = await submitQuizSession({
      lessonId: lesson.id,
      mode,
      startedAt: startedAtRef.current,
      answers
    });
    appendSession(session);
    appendRecords(records);
    setLastWrongCount(session.mistake_count);
    return session.score;
  };

  if (lessons.length === 0) {
    return <EmptyState title="课程数据加载中" description="请稍候再试。" />;
  }

  if (!running) {
    return (
      <div className="setup panel">
        <h2>开始练习</h2>
        <label className="field">
          <span>按课程出题</span>
          <select value={effectiveLessonId} onChange={(e) => setLessonId(Number(e.target.value))}>
            {lessons.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}（{item.symbol_ids.length} 字）
              </option>
            ))}
          </select>
        </label>
        <fieldset className="field">
          <span>练习模式</span>
          <div className="segmented">
            {PracticeMode.map((value) => (
              <button key={value} type="button" className={mode === value ? "seg active" : "seg"} onClick={() => setMode(value)}>
                {PracticeModeText[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field inline-field">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <span>启用每题 {TIMEOUT_MS / 1000} 秒限时（超时计入错题）</span>
        </label>
        <p className="muted">
          本课共 {lessonSymbols.length} 个字符，每个字符出 1 题；答错会自动按原因（点号错误 / 漏点 / 多点 / 字符识别错误 /
          超时）记入错题本。
        </p>
        <button type="button" className="btn btn-primary" onClick={start} disabled={lessonSymbols.length === 0}>
          开始练习
        </button>
      </div>
    );
  }

  return (
    <QuizRunner
      key={`${effectiveLessonId}-${mode}-${startedAtRef.current}`}
      symbols={lessonSymbols}
      mode={mode}
      timeoutMs={timed ? TIMEOUT_MS : undefined}
      onComplete={handleComplete}
      onExit={() => setRunning(false)}
      summaryPrimary={{
        label: lastWrongCount > 0 ? "去错题本订正 →" : "查看学习进度 →",
        onClick: () => navigate(lastWrongCount > 0 ? "/mistakes" : "/progress")
      }}
    />
  );
}
