# 盲文点字学习训练器

纯前端盲文点字学习与练习工具：学习卡片 → 课程练习（看点识字 / 听字写点 / 听音辨字）→ 错题订正 → 进度统计，四页共用 IndexedDB 本地数据，关掉浏览器下次还能接着练。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问 <http://localhost:20111>。

## 学习流程

1. **学习卡片 `/learn`**：按 6 门课程展示 44 个现行盲文字符（字母 A–Z、数字 0–9、常用标点、高频简写），点阵卡片显示凸点、字符、拼音与分类，可按简单 / 中等 / 困难切换；课程卡片直接显示完成进度。
2. **练习模式 `/practice`**：选课程 + 题型后按课程字符出题，逐题即时判定并显示正确答案与错误原因；结束后写一场练习会话和多条答题记录到 IndexedDB。
3. **错题本 `/mistakes`**：答错的字符按错误原因（字符辨识错误 / 点位记忆错误 / 听写辨音错误 / 未作答）归类，混合题型重新练习；**连续答对 2 次即达标移出待订正列表，练习进度与历史记录仍然保留**；再答错会重新进入。
4. **学习进度 `/progress`**：课程完成率（得分 ≥ 60 视为完成）、总体正确率、各难度掌握度（未练习 / 学习中 / 较熟悉 / 已掌握）、最近练习得分趋势，并提供「重置本地数据」。

## 本地开发方式

```bash
cd frontend && npm install && npm run dev
```

访问 Vite 提示的本地地址（默认端口 20111）。生产构建：`npm run build`。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI（已安装）/ Zustand + IndexedDB |
| 路由 | hash 路由（`src/router/routes.ts` + `src/main.tsx`） |
| 后端 | 无，纯本地模拟数据 |
| 数据库 | IndexedDB（四个实体各一个 object store） |
| 部署 | Docker Compose（Nginx 托管静态资源） |

## 项目目录结构

```text
frontend/src/
├── api/                  # BrailleSymbol / Lesson / PracticeSession / AnswerRecord 四个异步 API，封装 IndexedDB
├── services/             # PracticeService（出题/判定/落库）、MistakeService、LessonService、ProgressService
├── stores/               # Zustand 独立 store，四页共享
├── types/                # 数据模型与枚举类型
├── constants/            # 枚举常量、日志模板、错误码/错误消息、状态文案、达标规则
├── constructors/         # 各实体默认对象/表单对象构造器
├── components/common/    # BrailleCell、LessonProgress、PracticePanel、ResultBadge、ChartPanel 等
├── hooks/                # useBraillePattern、usePracticeSession、useIndexedDbStore
├── pages/                # LearnPage、PracticePage、MistakesPage、ProgressPage
├── router/               # 路由表
├── utils/                # localDb(IndexedDB)、braille(点阵解析)、formatters
└── mocks/                # seedData：44 个字符与 6 门课程的种子数据
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `braille-trainer`
- `FRONTEND_PORT`: 前端端口，默认 `20111`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: braille-trainer`。
- 容器名为 `${COMPOSE_PROJECT_NAME:-braille-trainer}-frontend`。
- 端口映射 `${FRONTEND_PORT:-20111}:80`，Nginx `try_files` 支持 SPA 路由。
- 常见问题：端口占用时改 `.env` 中端口后重启；需要重置学习数据可在「学习进度」页点击「重置本地数据」（课程与点字恢复初始状态，练习记录清空），或清浏览器站点数据。

## 枚举/常量出现位置清单

- **PracticeMode**（CELL_TO_TEXT / TEXT_TO_CELL / LISTENING / MIXED）：
  `types/PracticeMode`、`constants/PracticeMode`、`constants/statusText`、`types/PracticeSession`、`types/Question`、`constructors/PracticeSessionConstructor`、`services/PracticeService`、`hooks/usePracticeSession`、`pages/PracticePage`（题型筛选）、`components/common/PracticePanel`（按题型展示）、`pages/ProgressPage`（会话标识）。
- **SymbolCategory**（LETTER / NUMBER / PUNCTUATION / CONTRACTION）：
  `types/SymbolCategory`、`constants/SymbolCategory`、`constants/statusText`、`types/BrailleSymbol`、`mocks/seedData`、`pages/LearnPage`（卡片徽标/筛选展示）。
- **MasteryLevel**（NEW / LEARNING / FAMILIAR / MASTERED）：
  `types/MasteryLevel`、`constants/MasteryLevel`、`constants/statusText`、`services/ProgressService`（掌握度计算）、`pages/ProgressPage`（难度分布表与图表）。
- **Difficulty**（EASY / MEDIUM / HARD，本项目新增）：
  `types/Difficulty`、`constants/Difficulty`、`constants/statusText`、`types/BrailleSymbol`、`mocks/seedData`、`services/ProgressService`、`pages/LearnPage`（难度切换）、`pages/ProgressPage`（各难度掌握）。
- **MistakeReason**（WRONG_SYMBOL / WRONG_CELL / MISHEARD / EMPTY_ANSWER，本项目新增）：
  `types/MistakeReason`、`constants/MistakeReason`、`constants/statusText`、`types/AnswerRecord`、`types/Question`、`constructors/AnswerRecordConstructor`、`services/PracticeService`（判定原因）、`services/MistakeService`（按原因归类）、`components/common/PracticePanel`（反馈文案）、`pages/MistakesPage`（分组展示）。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、服务判定、store、筛选器和展示组件被刻意拆散在多个目录。例如把「错题达标连续答对数」从 2 改成 3，需要同步：`constants/practiceRules`、`services/MistakeService`（达标判定）、`pages/MistakesPage`（进度文案）、README；新增一种练习题型则要同步 PracticeMode 的 types/constants 两份定义、statusText、PracticeService 的出题与判定、MistakeReason（新错误原因）及其 types/constants/statusText、错题分组、PracticePanel 展示、筛选器与本清单。

## License

MIT
