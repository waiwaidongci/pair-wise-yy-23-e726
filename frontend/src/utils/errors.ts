import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** 业务异常：service 与 api 层各自包装，禁止在单一全局位置吞掉 */
export class AppError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode, cause?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    if (cause) (this as Error & { cause?: unknown }).cause = cause;
  }
}

/** service/api 统一包装原始 IndexedDB 异常 */
export function wrapError(code: ErrorCode, cause: unknown): AppError {
  if (cause instanceof AppError) return cause;
  return new AppError(code, cause);
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

export { ERROR_CODES };
