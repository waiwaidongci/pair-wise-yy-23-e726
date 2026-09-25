/* 端到端冒烟测试（node + fake-indexeddb）：
 * 种子注入 -> 课程出题 -> 即时判定归类 -> 会话/记录落库 -> 错题分组 ->
 * 复习达标移走（进度保留）-> 进度页统计。
 */
import "fake-indexeddb/auto";

// localStorage 垫片
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: (k) => void store.delete(k),
  clear: () => void store.clear()
};

let failures = 0;
const check = (name, cond) => {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    console.error(`  ✗ ${name}`);
    failures += 1;
  }
};

const { listBrailleSymbol } = await import("./src/api/BrailleSymbol.ts");
const { listLesson } = await import("./src/api/Lesson.ts");
const { listAnswerRecord } = await import("./src/api/AnswerRecord.ts");
const { listPracticeSession } = await import("./src/api/PracticeSession.ts");
const { buildQuestions, judgeChoice, judgeDots, submitQuizSession } = await import("./src/services/quizService.ts");
const { groupPendingMistakes, pendingMistakeSymbols, submitReview } = await import("./src/services/mistakesService.ts");
const { overallProgress, lessonProgress, difficultyMastery, masteryMap } = await import("./src/services/masteryService.ts");

console.log("1. 首次启动种子注入（IndexedDB）");
const symbols = await listBrailleSymbol();
const lessons = await listLesson();
check(`点字字符种子数 = 46（实际 ${symbols.length}）`, symbols.length === 46);
check(`课程种子数 = 7（实际 ${lessons.length}）`, lessons.length === 7);
check("点位数据是真实编号数组", JSON.stringify(symbols[0].cell_pattern) === JSON.stringify([1]));
check("难度枚举落在 EASY/MEDIUM/HARD", symbols.every((s) => ["EASY", "MEDIUM", "HARD"].includes(s.difficulty)));

console.log("2. 按课程出题与即时判定");
const lesson1 = lessons.find((l) => l.id === 1);
const lessonSymbols = symbols.filter((s) => lesson1.symbol_ids.includes(s.id));
const questions = buildQuestions(lessonSymbols, "MIXED", symbols);
check(`题目数 = 课程字符数 ${lessonSymbols.length}`, questions.length === lessonSymbols.length);
check("MIXED 已拆成具体题型", questions.every((q) => q.kind !== "MIXED"));
check("选择题有 4 个选项", questions.filter((q) => q.kind !== "TEXT_TO_CELL").every((q) => q.options.length === 4));
check("选项包含正确答案", questions.filter((q) => q.kind !== "TEXT_TO_CELL").every((q) => q.options.some((o) => o.id === q.symbol.id)));

// 判定归类
const aQ = questions.find((q) => q.symbol.letter === "a");
check("选择正确", judgeChoice(aQ, "a").correct === true);
check("选错原因 = WRONG_CHARACTER", judgeChoice(aQ, "b").reason === "WRONG_CHARACTER");
check("点符全对", judgeDots({ ...aQ }, [1]).correct === true);
check("漏点 -> MISSING_DOT", judgeDots({ ...aQ, symbol: { ...aQ.symbol, cell_pattern: [1, 2] } }, [1]).reason === "MISSING_DOT");
check("多点 -> EXTRA_DOT", judgeDots({ ...aQ, symbol: { ...aQ.symbol, cell_pattern: [1] } }, [1, 2]).reason === "EXTRA_DOT");
check("既漏又多 -> WRONG_DOT", judgeDots({ ...aQ, symbol: { ...aQ.symbol, cell_pattern: [1, 2] } }, [1, 4]).reason === "WRONG_DOT");

console.log("3. 模拟一局：a 对，b/c/d 错，e 对 -> 得分 40");
const byLetter = (l) => questions.find((q) => q.symbol.letter === l);
const makeAnswer = (q, correct, userAnswer, reason, latencyMs = 1000) => ({
  question: q,
  userAnswer: correct ? q.symbol.letter : userAnswer,
  correct,
  reason: correct ? null : reason,
  latencyMs,
  timedOut: false
});
const answers1 = [
  makeAnswer(byLetter("a"), true, "a", null),
  makeAnswer(byLetter("b"), false, "a", "WRONG_CHARACTER"),
  makeAnswer(byLetter("c"), false, "1·2", "MISSING_DOT", 3000),
  makeAnswer(byLetter("d"), false, "x", "WRONG_CHARACTER", 2000),
  makeAnswer(byLetter("e"), true, "e", null)
];
const { session: s1 } = await submitQuizSession({
  lessonId: 1,
  mode: "MIXED",
  startedAt: new Date().toISOString(),
  answers: answers1
});
check(`会话得分 40（实际 ${s1.score}）`, s1.score === 40);
check(`错题数 3（实际 ${s1.mistake_count}）`, s1.mistake_count === 3);
check(`总题数 5（实际 ${s1.total_count}）`, s1.total_count === 5);
check("普通课程会话 source=null", s1.source === null);

let records = await listAnswerRecord();
let sessions = await listPracticeSession();
check(`答题记录落库 5 条（实际 ${records.length}）`, records.length === 5);
check("答错记录带原因且未订正", records.filter((r) => !r.correct).every((r) => r.mistake_reason && r.resolved === false));
check("答对记录 reason=null", records.filter((r) => r.correct).every((r) => r.mistake_reason === null));
check("latency_ms 已保存", records.some((r) => r.latency_ms === 3000));

console.log("4. 错题本归类（待订正）");
const grouped = groupPendingMistakes(records, symbols);
check(`有原因分组（实际 ${grouped.size} 组）`, grouped.size >= 2);
check("WRONG_CHARACTER 组有 b/d", (grouped.get("WRONG_CHARACTER") ?? []).some((i) => i.symbol.letter === "b") && (grouped.get("WRONG_CHARACTER") ?? []).some((i) => i.symbol.letter === "d"));
check("MISSING_DOT 组有 c", (grouped.get("MISSING_DOT") ?? []).some((i) => i.symbol.letter === "c"));
const pending = pendingMistakeSymbols(records, symbols);
check(`待订正字符 3 个（实际 ${pending.length}）`, pending.length === 3);

console.log("5. 课程未达标（40 < 80）");
const lp1 = lessonProgress(lesson1, sessions, records);
check(`lesson1 未完成（best=${lp1.bestScore}）`, lp1.completed === false && lp1.bestScore === 40);

console.log("6. 再练一次全对 -> 100 分，课程达标");
const q2 = buildQuestions(lessonSymbols, "CELL_TO_TEXT", symbols);
const answers2 = q2.map((q) => makeAnswer(q, true, q.symbol.letter, null));
const { session: s2 } = await submitQuizSession({
  lessonId: 1,
  mode: "CELL_TO_TEXT",
  startedAt: new Date().toISOString(),
  answers: answers2
});
check(`第二局得分 100（实际 ${s2.score}）`, s2.score === 100);
records = await listAnswerRecord();
sessions = await listPracticeSession();
const lp1b = lessonProgress(lesson1, sessions, records);
check("lesson1 达标完成", lp1b.completed === true && lp1b.bestScore === 100);

console.log("7. 错题复习：全部答对 -> 达标，错题移走，复习会话保留");
const beforeSessions = sessions.length;
const reviewQ = buildQuestions(pending, "MIXED", symbols);
const reviewAnswers = reviewQ.map((q) => makeAnswer(q, true, q.symbol.letter, null));
const pendingRecords = records.filter((r) => !r.resolved && !r.correct);
const review = await submitReview(reviewAnswers, pendingRecords);
check(`复习达标 passed=true score=${review.score}`, review.passed === true && review.score === 100);
check(`移走错题记录 3 条（实际 ${review.resolvedCount}）`, review.resolvedCount === 3);
records = await listAnswerRecord();
sessions = await listPracticeSession();
check("旧错题已 resolved", records.filter((r) => r.symbol_id !== undefined && ["b", "c", "d"].includes(symbols.find((s) => s.id === r.symbol_id)?.letter)).filter((r) => !r.correct).every((r) => r.resolved === true));
check(`复习会话已保存（场次 ${beforeSessions} -> ${sessions.length}）`, sessions.length === beforeSessions + 1);
check("复习会话 source=REVIEW / lesson_id=0", sessions.some((s) => s.source === "REVIEW" && s.lesson_id === 0));
const afterPending = pendingMistakeSymbols(records, symbols);
check(`待订正列表清空（实际 ${afterPending.length}）`, afterPending.length === 0);

console.log("8. 进度页统计");
const overall = overallProgress(lessons, sessions, records);
check(`课程完成率 = 1/7 ≈ ${(overall.lessonCompletionRate * 100).toFixed(0)}%`, Math.abs(overall.lessonCompletionRate - 1 / 7) < 1e-9);
check("统计复习场次 = 1", overall.reviewSessions === 1);
check(`课程练习答题数 = 10（实际 ${overall.totalAnswers}，复习 3 题不计入）`, overall.totalAnswers === 10);
check(`课程练习正确率 = 7/10 = 70%（实际 ${(overall.accuracy * 100).toFixed(0)}%）`, Math.abs(overall.accuracy - 0.7) < 1e-9);
const diff = difficultyMastery(symbols, records);
check("难度桶为 EASY/MEDIUM/HARD", diff.map((d) => d.difficulty).join(",") === "EASY,MEDIUM,HARD");
const easy = diff.find((d) => d.difficulty === "EASY");
check("简单难度统计含 a-j 与数字 0-9（共 20）", easy.total === 20);
const mastery = masteryMap(records);
check("a/b/c/d/e 标记为 MASTERED（最近窗口全对）", ["a", "b", "c", "d", "e"].every((l) => mastery.get(symbols.find((s) => s.letter === l).id) === "MASTERED"));

console.log("9. 未达标复习不移走");
// 造一条新错题：课程 2 找一个字符故意答错
const lesson2 = lessons.find((l) => l.id === 2);
const l2syms = symbols.filter((s) => lesson2.symbol_ids.includes(s.id));
const q3 = buildQuestions(l2syms.slice(0, 2), "CELL_TO_TEXT", symbols);
await submitQuizSession({ lessonId: 2, mode: "CELL_TO_TEXT", startedAt: new Date().toISOString(), answers: q3.map((q, i) => makeAnswer(q, i === 0, i === 0 ? q.symbol.letter : "?", i === 0 ? null : "WRONG_CHARACTER")) });
records = await listAnswerRecord();
const pend2 = pendingMistakeSymbols(records, symbols);
check("出现 1 个新待订正字符", pend2.length === 1);
const rq = buildQuestions(pend2, "MIXED", symbols);
const badReview = await submitReview(rq.map((q) => makeAnswer(q, false, "?", "WRONG_CHARACTER")), records.filter((r) => !r.resolved && !r.correct));
check("0 分复习不达标", badReview.passed === false && badReview.score === 0);
records = await listAnswerRecord();
check("错题仍保留在待订正列表", pendingMistakeSymbols(records, symbols).length === 1);

if (failures > 0) {
  console.error(`\n${failures} 项检查失败`);
  process.exit(1);
}
console.log("\n全部冒烟检查通过 ✅");
