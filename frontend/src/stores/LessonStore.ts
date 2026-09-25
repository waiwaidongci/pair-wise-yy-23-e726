import { create } from "zustand";
import { listLesson } from "../api/Lesson";
import type { Lesson } from "../types/Lesson";

type State = {
  rows: Lesson[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useLessonStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listLesson(), loaded: true });
    } finally {
      set({ loading: false });
    }
  }
}));
