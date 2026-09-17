import { create } from "zustand";
import { DICT } from "@/lib/operator/translate";
import { canLoad, refuseSecret, route, usedMb, type Job } from "./gpus";

type Hit = { job: Job; gpu: 0 | 1; model: string; in: string; out: string };

type GpuS = {
  loaded: string[];
  last?: Hit;
  err?: string;
  load: (id: string) => void;
  unload: (id: string) => void;
  run: (job: Job, text: string) => void;
};

const DEFAULT = ["hy-mt-1.8", "rapid-ocr"];

export const useGpu = create<GpuS>()((set, get) => ({
  loaded: DEFAULT,
  load: (id) => {
    const loaded = get().loaded;
    if (!canLoad(loaded, id)) {
      set({ err: "VRAM 부족" });
      return;
    }
    if (loaded.includes(id)) return;
    set({ loaded: [...loaded, id], err: undefined });
  },
  unload: (id) => set({ loaded: get().loaded.filter((x) => x !== id), err: undefined }),
  run: (job, text) => {
    if (refuseSecret(text)) {
      set({ err: "1급 · 모델 입력 차단", last: undefined });
      return;
    }
    const r = route(job);
    if (r.gpu === 1 && !get().loaded.includes(r.model) && r.model !== "rapid-ocr") {
      set({ err: `${r.model} 미적재` });
      return;
    }
    if (job === "ocr-box" && !get().loaded.includes("rapid-ocr")) {
      set({ err: "OCR 미적재" });
      return;
    }
    const out =
      job === "ocr-box"
        ? `box×${Object.keys(DICT).length}`
        : (DICT[text] ?? `${text} → ko`);
    set({
      last: { job, gpu: r.gpu, model: r.model, in: text, out },
      err: undefined,
    });
  },
}));

export { usedMb };
