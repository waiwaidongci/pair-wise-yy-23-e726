export function ResultBadge({ correct, correctText, reasonText }: { correct: boolean; correctText?: string; reasonText?: string }) {
  return (
    <div className={correct ? "result-badge ok" : "result-badge bad"}>
      <strong>{correct ? "✓ 回答正确" : "✗ 回答错误"}</strong>
      {!correct && correctText ? <span>正确答案：{correctText}</span> : null}
      {!correct && reasonText ? <span>错误原因：{reasonText}</span> : null}
    </div>
  );
}
