/** 练习流程共享配置：调门槛/题量时 store、service、页面都会受影响 */
export const PRACTICE_CONFIG = {
  /** 达标分数线：课程完成、错题复习移走出同一口径 */
  PASS_SCORE: 80,
  /** 每题选项数（看点识字 / 听写） */
  OPTION_COUNT: 4,
  /** 计算掌握度时回看的最近答题条数 */
  MASTERY_WINDOW: 5,
  /** 掌握：窗口内正确率阈值 */
  MASTERED_ACCURACY: 0.9,
  /** 熟悉：窗口内正确率阈值 */
  FAMILIAR_ACCURACY: 0.6,
  MASTERED_MIN_ATTEMPTS: 2
} as const;
