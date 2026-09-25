import { create } from "zustand";
import { listPracticeSession } from "../api/PracticeSession";
import type { PracticeSession } from "../types/PracticeSession";

type State = {
  rows: PracticeSession[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  append: (session: PracticeSession) => void;
};

export const usePracticeSessionStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listPracticeSession(), loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  append(session) {
    set({ rows: [...get().rows, session] });
  }
}));
