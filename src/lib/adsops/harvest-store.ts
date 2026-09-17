import { create } from "zustand";
import { BOARDS, FEED, harvestAll, MENUS, STORED, type BoardId, type Hit } from "./harvest";

type Page = "home" | "list" | "post";

type HS = {
  page: Page;
  board?: BoardId;
  hits: Hit[];
  saved: Hit[];
  running: boolean;
  step: string;
  vl: string;
  pick: (id: BoardId) => void;
  open: (id: string) => void;
  run: () => Promise<void>;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useHarvest = create<HS>()((set, get) => ({
  page: "home",
  hits: [],
  saved: [],
  running: false,
  step: "대기",
  vl: "",
  pick: (id) => set({ page: "list", board: id }),
  open: (id) => {
    const hit = get().hits.find((h) => h.post.id === id) ?? get().saved.find((h) => h.post.id === id);
    if (hit) set({ page: "post", hits: get().hits });
  },
  run: async () => {
    if (get().running) return;
    set({ running: true, page: "home", hits: [], step: "홈 · VL 메뉴", vl: MENUS.join(" · ") });
    await sleep(280);
    set({ step: "정보공유 진입", page: "list", board: "share" });
    await sleep(220);
    const all = harvestAll();
    set({ hits: all, step: "목록 추출 · BGE-M3 비교", vl: "게시 " + FEED.length });
    await sleep(280);
    set({ step: "8B 잡담 거르고 30B-A3B 중요도", vl: "GPU0 8B → GPU1 30B-A3B" });
    await sleep(280);
    const saved = all.filter((h) => h.verdict !== "skip");
    set({
      running: false,
      saved,
      step: `저장 ${saved.filter((h) => h.verdict === "keep").length} · 갱신 ${saved.filter((h) => h.verdict === "update").length} · 건너뜀 ${all.length - saved.length}`,
      page: "list",
      board: "share",
    });
  },
}));

export { BOARDS };
