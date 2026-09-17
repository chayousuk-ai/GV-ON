import { create } from "zustand";
import { planImport, SCAN, type ChromeRow } from "./chrome-import";
import { maskSecret, saveBag } from "../operator/memory";
import { useEngine } from "../operator/store";
import type { Bookmark, MemoryHit, VaultItem } from "../operator/memory";
import type { SurfaceId } from "../operator/types";

type Log = { t: string; ok: boolean };

type CS = {
  closed: boolean;
  grant: boolean;
  scanned: boolean;
  done?: ReturnType<typeof planImport>;
  logs: Log[];
  setClosed: (v: boolean) => void;
  setGrant: (v: boolean) => void;
  scan: () => void;
  apply: () => void;
};

function portalOf(host: string): SurfaceId {
  if (host.includes("naver")) return "naver";
  if (host.includes("google") || host.includes("ads.google")) return "gads";
  return "naver";
}

export const useChromeImport = create<CS>()((set, get) => ({
  closed: false,
  grant: false,
  scanned: false,
  logs: [],
  setClosed: (closed) => set({ closed }),
  setGrant: (grant) => set({ grant }),
  scan: () => {
    const { closed, grant } = get();
    const done = planImport(SCAN, { closed, grant });
    set({
      scanned: true,
      done,
      logs: [{ t: `스캔 ${SCAN.length} · 가져올 ${done.ok.length} · 건너뜀 ${done.skip.length}`, ok: done.ok.length > 0 }, ...get().logs].slice(0, 8),
    });
  },
  apply: () => {
    const { closed, grant } = get();
    const done = planImport(SCAN, { closed, grant });
    if (!done.ok.length) {
      set({ done, logs: [{ t: done.skip[0]?.why ?? "가져올 항목 없음", ok: false }, ...get().logs].slice(0, 8) });
      return;
    }
    const now = Date.now();
    const bookmarks: Bookmark[] = done.ok
      .filter((d) => d.row.kind === "bookmark")
      .map((d, i) => ({ id: `cim-b-${i}`, title: d.row.title, host: d.row.host, portal: portalOf(d.row.host), at: now }));
    const vault: VaultItem[] = done.ok
      .filter((d) => d.row.kind === "login")
      .map((d, i) => ({ id: `cim-v-${i}`, host: d.row.host, user: d.row.title, cipher: maskSecret(), at: now }));
    const memories: MemoryHit[] = done.ok
      .filter((d) => d.row.kind === "history")
      .map((d, i) => ({
        id: `cim-h-${i}`,
        collection: "pages" as const,
        title: d.row.title,
        body: `크롬 기록 · ${d.row.host}`,
        url: `https://${d.row.host}`,
        at: now,
      }));
    useEngine.setState((s) => {
      const bag = {
        bookmarks: [...bookmarks, ...s.bookmarks].slice(0, 80),
        vault: [...vault, ...s.vault].slice(0, 40),
        memories: [...memories, ...s.memories].slice(0, 80),
        reports: s.reports,
      };
      saveBag(bag);
      return bag;
    });
    set({
      done,
      logs: [{ t: `즐겨찾기 ${done.counts.bookmark} · 금고 ${done.counts.login} · 쿠키 ${done.counts.cookie} · 기록 ${done.counts.history}`, ok: true }, ...get().logs].slice(0, 8),
    });
  },
}));

export type { ChromeRow };
