import { create } from "zustand";
import { listBrailleSymbol } from "../api/BrailleSymbol";
import type { BrailleSymbol } from "../types/BrailleSymbol";

type State = {
  rows: BrailleSymbol[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useBrailleSymbolStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listBrailleSymbol(), loaded: true });
    } finally {
      set({ loading: false });
    }
  }
}));
