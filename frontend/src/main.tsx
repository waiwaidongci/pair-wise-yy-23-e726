import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { routes, DEFAULT_ROUTE } from "./router/routes";
import { useRoute, navigate } from "./router/useRoute";
import { useIndexedDbStore } from "./hooks/useIndexedDbStore";
import { useAnswerRecordStore } from "./stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "./stores/BrailleSymbolStore";
import { LearnPage } from "./pages/LearnPage";
import { PracticePage } from "./pages/PracticePage";
import { MistakesPage } from "./pages/MistakesPage";
import { ProgressPage } from "./pages/ProgressPage";
import { groupPendingMistakes } from "./services/mistakesService";
import "./styles.css";

function PageShell() {
  const { ready, error } = useIndexedDbStore();
  const route = useRoute();
  const records = useAnswerRecordStore((s) => s.rows);
  const symbols = useBrailleSymbolStore((s) => s.rows);

  const pendingTotal = useMemo(() => {
    const grouped = groupPendingMistakes(records, symbols);
    let total = 0;
    grouped.forEach((list) => {
      total += list.length;
    });
    return total;
  }, [records, symbols]);

  const queryLesson = Number(route.query.get("lesson") ?? "0") || undefined;

  const renderPage = () => {
    if (error) {
      return (
        <main className="page">
          <div className="panel empty">
            <strong>本地数据加载失败</strong>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              重新加载
            </button>
          </div>
        </main>
      );
    }
    if (!ready) {
      return (
        <main className="page">
          <div className="panel empty">
            <strong>正在加载本地盲文数据…</strong>
            <p>首次打开会把点字与课程写入浏览器 IndexedDB。</p>
          </div>
        </main>
      );
    }
    switch (route.path) {
      case "/learn":
      case "/":
        return (
          <main className="page">
            <PageHeader title="学习卡片" subtitle="按课程浏览点字卡片，可按难度切换" />
            <LearnPage />
          </main>
        );
      case "/practice":
        return (
          <main className="page">
            <PageHeader title="练习模式" subtitle="按课程出题，即时判定，答题记录自动保存" />
            <PracticePage initialLessonId={queryLesson} />
          </main>
        );
      case "/mistakes":
        return (
          <main className="page">
            <PageHeader title="错题本" subtitle="按错误原因归类，复习达标即移走，进度仍保留" />
            <MistakesPage />
          </main>
        );
      case "/progress":
        return (
          <main className="page">
            <PageHeader title="学习进度" subtitle="课程完成率、正确率与各难度掌握情况" />
            <ProgressPage />
          </main>
        );
      default:
        return (
          <main className="page">
            <PageHeader title="页面不存在" subtitle="即将返回学习卡片" />
          </main>
        );
    }
  };

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          盲文点字<br />学习训练器
        </div>
        <nav>
          {routes.map((item) => {
            const active = route.path === item.route || (route.path === "/" && item.route === DEFAULT_ROUTE);
            const badge = item.route === "/mistakes" && pendingTotal > 0 ? pendingTotal : null;
            return (
              <button key={item.route} className={active ? "active" : ""} onClick={() => navigate(item.route)}>
                <span>{item.name}</span>
                {badge !== null ? <em className="nav-badge">{badge}</em> : null}
              </button>
            );
          })}
        </nav>
        <p className="sidebar-foot">数据存浏览器本地（IndexedDB），下次打开继续练。</p>
      </aside>
      {renderPage()}
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-head">
      <div>
        <p className="eyebrow">braille-trainer</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PageShell />
  </React.StrictMode>
);
