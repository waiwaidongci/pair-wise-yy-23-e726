import { create } from "zustand";
import { listAnswerRecord } from "../api/AnswerRecord";
import type { AnswerRecord } from "../types/AnswerRecord";

type State = {
  rows: AnswerRecord[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  appendMany: (records: AnswerRecord[]) => void;
  /** 复习达标后用最新本地数据替换，保证待订正列表立即移除 */
  replace: (records: AnswerRecord[]) => void;
};

export const useAnswerRecordStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listAnswerRecord(), loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  appendMany(records) {
    set({ rows: [...get().rows, ...records] });
  },
  replace(records) {
    set({ rows: records });
  }
}));
