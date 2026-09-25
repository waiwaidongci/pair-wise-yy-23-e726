import { useEffect, useState } from "react";
import { ensureSeeded } from "../utils/localDb";

// 应用启动时确保 IndexedDB 已建库并播种，四个页面共用这份本地数据
export function useIndexedDbStore() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    ensureSeeded()
      .then(() => {
        if (alive) setReady(true);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      alive = false;
    };
  }, []);

  return { ready, error };
}
