import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "../stores/appStore";

/**
 * 统一的 IndexedDB 本地资源加载入口。
 * 四页共用同一个 store 快照，首次挂载触发 bootstrap，下次打开仍读本地持久化数据。
 */
export function useIndexedDbStore() {
  const ready = useAppStore((s) => s.ready);
  const error = useAppStore((s) => s.error);
  const bootstrap = useAppStore((s) => s.bootstrap);

  const [reloadTick, setReloadTick] = useState(0);
  const reload = useCallback(async () => {
    await useAppStore.getState().reloadRecords();
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return { ready, error, reload, reloadTick };
}
