import { create } from "zustand";
import { useBrailleSymbolStore } from "./BrailleSymbolStore";
import { useLessonStore } from "./LessonStore";
import { usePracticeSessionStore } from "./PracticeSessionStore";
import { useAnswerRecordStore } from "./AnswerRecordStore";

/**
 * 四页共用本地数据：首次进入并行拉取四张表，
 * 之后练习/复习写入各自 store，切页无需重新请求。
 */
type AppState = {
  ready: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  reloadRecords: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  async bootstrap() {
    if (get().ready) return;
    try {
      await Promise.all([
        useBrailleSymbolStore.getState().load(),
        useLessonStore.getState().load(),
        usePracticeSessionStore.getState().load(),
        useAnswerRecordStore.getState().load()
      ]);
      set({ ready: true, error: null });
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "本地数据加载失败" });
    }
  },
  async reloadRecords() {
    await useAnswerRecordStore.getState().load();
    await usePracticeSessionStore.getState().load();
  }
}));
