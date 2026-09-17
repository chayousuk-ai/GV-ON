import { create } from "zustand";
import { pickPlace, type Seat } from "./fleet";
import type { Job } from "./gpus";

type Log = { t: string; ok: boolean };

type FS = {
  pane: "grant" | "fleet" | "chrome";
  seat: Seat;
  localOn: boolean;
  studioOn: boolean;
  last?: { place: string; where: string; why: string };
  logs: Log[];
  setPane: (p: "grant" | "fleet" | "chrome") => void;
  setSeat: (s: Seat) => void;
  setLocal: (v: boolean) => void;
  setStudio: (v: boolean) => void;
  tryJob: (job: Job, prompt?: string) => void;
};

export const useFleet = create<FS>()((set, get) => ({
  pane: "grant",
  seat: "owner",
  localOn: true,
  studioOn: false,
  logs: [],
  setPane: (pane) => set({ pane }),
  setSeat: (seat) => set({ seat }),
  setLocal: (localOn) => set({ localOn }),
  setStudio: (studioOn) => set({ studioOn }),
  tryJob: (job, prompt) => {
    const r = pickPlace({ ...get(), job, prompt });
    set((s) => ({
      last: r,
      logs: [{ t: `${job} → ${r.place} · ${r.why}`, ok: r.place !== "none" }, ...s.logs].slice(0, 8),
    }));
  },
}));
