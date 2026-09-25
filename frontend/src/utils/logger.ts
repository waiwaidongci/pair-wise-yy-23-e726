import { LOG_TEMPLATES } from "../constants/logTemplates";

type LogEntity = keyof typeof LOG_TEMPLATES;
type LogParams = Record<string, string | number | boolean>;

const interpolate = (template: string, params?: LogParams) =>
  params ? template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`)) : template;

/** 所有写操作统一经过这里落日志，禁止各层自行 console 拼装 */
export function writeLog(entity: LogEntity, index: number, params?: LogParams) {
  const templates = LOG_TEMPLATES[entity];
  const template = templates[index] ?? templates[0];
  console.info(`[braille-trainer][${entity}] ${interpolate(template, params)}`);
}
