import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useIndexedDbStore } from "./hooks/useIndexedDbStore";
import { LearnPage } from "./pages/LearnPage";
import { PracticePage } from "./pages/PracticePage";
import { MistakesPage } from "./pages/MistakesPage";
import { ProgressPage } from "./pages/ProgressPage";
import "./styles.css";

const pages: Record<string, () => JSX.Element> = {
  "/learn": LearnPage,
  "/practice": PracticePage,
  "/mistakes": MistakesPage,
  "/progress": ProgressPage
};

function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return pages[hash] ? hash : "/learn";
}

function App() {
  const { ready, error } = useIndexedDbStore();
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const ActivePage = pages[route] ?? LearnPage;

  return (
    <div className="shell">
      <aside>
        <div className="brand">盲文点字学习训练器</div>
        <nav>
          {routes.map((item) => (
            <a
              key={item.route}
              className={route === item.route ? "nav-link active" : "nav-link"}
              href={`#${item.route}`}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
      <main>
        {error ? (
          <section className="page">
            <div className="empty"><strong>本地存储不可用</strong><p>{error}</p></div>
          </section>
        ) : !ready ? (
          <section className="page">
            <div className="empty"><strong>正在准备本地数据…</strong></div>
          </section>
        ) : (
          <ActivePage />
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
