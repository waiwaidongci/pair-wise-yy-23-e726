/**
 * 写操作日志模板：每个实体至少 4 条，所有写操作都要经 logger 落日志。
 * 修改字段/动作时需同步新增模板与调用处。
 */
export const LOG_TEMPLATES = {
  BrailleSymbol: [
    "点字字符创建：{letter}",
    "点字字符更新：{letter}",
    "点字字符难度变更：{letter} -> {difficulty}",
    "点字字符导出：{count} 条"
  ],
  Lesson: [
    "课程创建：{title}",
    "课程更新：{title}",
    "课程卡片学习进度变更：{title} {percent}%",
    "课程导出：{count} 条"
  ],
  PracticeSession: [
    "练习会话创建：课程 {lesson_id} / 模式 {mode}",
    "练习会话更新：#{id}",
    "练习会话完成：#{id} 得分 {score}",
    "练习会话导出：{count} 条"
  ],
  AnswerRecord: [
    "答题记录创建：字符 {symbol_id} 判定 {correct}",
    "答题记录更新：#{id}",
    "错题订正状态变更：字符 {symbol_id} resolved={resolved}",
    "答题记录导出：{count} 条"
  ]
} as const;
