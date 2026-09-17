import type { SurfaceId } from "./types";

export type ChromePanel = "none" | "bookmarks" | "vault" | "memory" | "reports" | "policy";

export type Bookmark = {
  id: string;
  title: string;
  host: string;
  portal: SurfaceId;
  at: number;
};

export type VaultItem = {
  id: string;
  host: string;
  user: string;
  cipher: string;
  at: number;
};

export type MemoryHit = {
  id: string;
  collection: "pages" | "runs" | "jobs";
  title: string;
  body: string;
  url: string;
  at: number;
};

export type Report = {
  id: string;
  title: string;
  kind: "ads" | "analytics" | "ops";
  body: string;
  at: number;
};

export type Bag = {
  bookmarks: Bookmark[];
  vault: VaultItem[];
  memories: MemoryHit[];
  reports: Report[];
};

const KEY = "gvon.qdrant";

export const SEED: Bag = {
  bookmarks: [
    { id: "bm-naver", title: "검색 랩", host: "search.lab", portal: "naver", at: Date.now() },
    { id: "bm-ads", title: "구글광고 랩", host: "ads.lab", portal: "gads", at: Date.now() },
  ],
  vault: [
    { id: "v1", host: "search.lab", user: "gvon.local", cipher: "••••••••", at: Date.now() },
  ],
  memories: [],
  reports: [
    {
      id: "r0",
      title: "주간 소진 초안",
      kind: "ads",
      body: "브랜드 검색 ₩428,000 · 경쟁 ₩219,000. 라이브 mutate 없음.",
      at: Date.now() - 86400000,
    },
  ],
};

export function loadBag(): Bag {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SEED);
    return { ...SEED, ...JSON.parse(raw) } as Bag;
  } catch {
    return structuredClone(SEED);
  }
}

export function saveBag(bag: Bag) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bag));
  } catch {
    /* quota */
  }
}

export function maskSecret() {
  return "••••••••";
}
