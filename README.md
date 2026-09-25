# 盲文点字学习训练器（braille-trainer）

纯前端盲文点字学习与练习工具：点字卡片按难度切换 → 按课程出题即时判定 → 答错自动进错题本 → 复习达标移走 → 进度页统计。四页共用 IndexedDB 本地数据，关闭浏览器后下次打开继续练。

## 快速启动（推荐 Docker）

```bash
cp .env.example .env && docker compose up -d
```

启动后访问：<http://localhost:20111>

停止：`docker compose down`（数据在浏览器本地，容器无状态）。

## 本地开发方式

```bash
cd frontend
npm install
npm run dev      # http://localhost:20111
```

其他命令：

- `npm run build`：TypeScript 类型检查 + Vite 生产构建
- `npm run smoke`：端到端冒烟测试（基于 `fake-indexeddb`，覆盖出题判定→落库→错题订正→进度统计全链路）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite |
| UI | Material UI（依赖内置，当前样式以原生 CSS 实现）+ 自研共享组件 |
| 状态管理 | Zustand（按实体拆独立 store） |
| 本地存储 | IndexedDB（自封装 Promise 版，localStorage 存自增 ID） |
| 语音 | 浏览器内置 Web Speech API（听写模拟，不接第三方服务） |
| 部署 | Docker Compose + Nginx（SPA `try_files`） |

## 学习闭环

1. **学习卡片 `/learn`**：按课程展示标准 6 点制点字，难度分段（全部/简单/中等/困难）切换，卡片含字母、拼音、点位；可一键进入本课练习。
2. **练习模式 `/practice`**：按课程字符出题，支持看点识字 / 看字点符 / 听写 / 混合四种模式与可选限时；选择或点亮点位后**即时判定**并按原因归类，交卷保存 `PracticeSession` + 多条 `AnswerRecord`。
3. **错题本 `/mistakes`**：答错字符按原因（点号错误 / 漏点 / 多点 / 字符识别错误 / 超时）分组；可全部、按组、针对性复习。复习得分 **≥ 80** 即把该字符待订正记录置为 `resolved` 移走，**复习这一局仍作为练习记录保留**；也可手动标记掌握。
4. **学习进度 `/progress`**：课程完成率（最佳成绩 ≥ 80 视为完成）、课程练习正确率、最近得分趋势、各难度（简单/中等/困难）掌握分布，以及含错题复习在内的最近练习记录。

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（IndexedDB 模拟，写操作落日志）
├── db/                   # IndexedDB 封装、首启种子注入、自增 ID
├── stores/               # Zustand 独立 store：四个实体 + appStore 聚合加载
├── types/                # 数据模型类型 + 枚举类型（从 constants 单一定义导出）
├── constants/            # 枚举、日志模板、错误码/错误消息、状态文案、练习达标配置
├── constructors/         # 默认对象 / 表单对象 / 判定响应对象构造器
├── services/             # quizService 出题判定、masteryService 统计、mistakesService 错题流程
├── components/common/    # BrailleCell / LessonProgress / PracticePanel / ResultBadge /
│                         # ChartPanel / StatusBadge / EmptyState / StatCard / QuizRunner / AudioButton
├── hooks/                # useIndexedDbStore / useBraillePattern / usePracticeSession
├── pages/                # LearnPage / PracticePage / MistakesPage / ProgressPage
├── router/               # routes 配置 + 极简 history 路由
├── utils/                # formatters、logger、AppError 异常包装
├── mocks/                # 真实盲文点位种子（a-z、数字、标点、简写符）与课程
└── main.tsx              # 外壳/导航/路由出口
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`：Compose 项目名，默认 `braille-trainer`
- `FRONTEND_PORT`：前端端口，默认 `20111`

## Docker 部署说明

- 根 `docker-compose.yml` 不写 `version`，顶层 `name: braille-trainer`。
- 容器名：`${COMPOSE_PROJECT_NAME:-braille-trainer}-frontend`。
- 端口映射：`${FRONTEND_PORT:-20111}:80`。
- 纯前端、无命名卷；练习数据保存在用户浏览器 IndexedDB（库名 `braille-trainer`），因此任意目录名（含中文目录）均可构建启动。
- 常见问题：端口占用改 `.env` 的 `FRONTEND_PORT`；要清空学习数据在浏览器里清除站点数据（IndexedDB + localStorage）。

## 枚举/常量出现位置清单

- **PracticeMode**（CELL_TO_TEXT / TEXT_TO_CELL / LISTENING / MIXED）
  `constants/PracticeMode.ts`（值+中文案）、`types/PracticeMode.ts`（类型转出）、
  `types/PracticeSession.ts`（字段类型）、`constructors/PracticeSessionConstructor.ts`（默认值）、
  `constants/statusText.ts`（文案聚合）、`utils/formatters.ts`（formatPracticeMode）、
  `services/quizService.ts`（建题拆题）、`pages/PracticePage.tsx`（模式筛选器）、
  `components/common/PracticePanel.tsx`（题型展示）、`pages/ProgressPage.tsx`（记录展示）。
- **SymbolCategory**（LETTER / NUMBER / PUNCTUATION / CONTRACTION）
  `constants/SymbolCategory.ts`、`types/SymbolCategory.ts`、
  `types/BrailleSymbol.ts`（字段类型）、`constructors/BrailleSymbolConstructor.ts`、
  `mocks/seedData.ts`（种子分类）、`constants/statusText.ts`、`utils/formatters.ts`、
  `pages/LearnPage.tsx`（卡片角标/筛选）。
- **MasteryLevel**（NEW / LEARNING / FAMILIAR / MASTERED）
  `constants/MasteryLevel.ts`、`types/MasteryLevel.ts`、`constants/statusText.ts`、
  `utils/formatters.ts`、`services/masteryService.ts`（掌握度计算与难度分布）、
  `pages/ProgressPage.tsx`（各难度掌握展示）。
- **Difficulty**（EASY / MEDIUM / HARD，新增）
  `constants/Difficulty.ts`、`types/Difficulty.ts`、`types/BrailleSymbol.ts`、
  `mocks/seedData.ts`、`constants/statusText.ts`、`utils/formatters.ts`、
  `pages/LearnPage.tsx`（难度切换器）、`services/masteryService.ts`（难度分布）。
- **MistakeReason**（WRONG_DOT / MISSING_DOT / EXTRA_DOT / WRONG_CHARACTER / TIMEOUT，新增）
  `constants/MistakeReason.ts`、`types/MistakeReason.ts`、`types/AnswerRecord.ts`、
  `constructors/AnswerRecordConstructor.ts`、`constants/statusText.ts`、`utils/formatters.ts`、
  `services/quizService.ts`（判定归类）、`services/mistakesService.ts`（错题分组/复习）、
  `components/common/ResultBadge.tsx`、`pages/MistakesPage.tsx`（按原因分组展示）。

## 为什么会牵一发动全身

点字、课程、会话、答题记录四类实体分别贯穿 `mocks → db → api → store → services → hooks → components → pages`
全链路；枚举在常量/类型/构造器/日志/错误/格式化/筛选/展示多处引用；写操作统一经 `utils/logger` 落日志、
经 `utils/errors` 包装异常；达标线集中在 `constants/practiceConfig.ts`。改一个判定原因或难度枚举，
至少触达常量、类型、种子、构造器、判定服务、错题分组、徽标、页面等 3–8 个文件。

## License

MIT
