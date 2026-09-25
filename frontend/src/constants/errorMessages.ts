import type { ErrorCode } from "./errorCodes";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "本地数据不存在，请刷新后重试",
  LOCAL_DB_FAILED: "本地数据库读写失败，练习进度可能无法保存",
  INVALID_ANSWER: "答案格式不正确，请点亮点位或选择字符后提交",
  EMPTY_QUIZ: "当前范围没有可练习的字符"
};
