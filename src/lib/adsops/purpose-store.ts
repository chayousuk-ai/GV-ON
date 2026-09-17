import { create } from "zustand";
import { useFleet } from "./fleet-store";
import {
  BRANDS,
  decideApproval,
  handoffSafe,
  isolateDraft,
  SEED_ALERTS,
  SEED_APPROVALS,
  type Approval,
  type BrandId,
  type DeskPane,
  type Ritual,
} from "./purpose";

type Log = { t: string; ok: boolean };

type PS = {
  pane: DeskPane;
  ritual: Ritual;
  brand: BrandId;
  approvals: Approval[];
  alerts: typeof SEED_ALERTS;
  notes: string[];
  savedHandoff: boolean;
  suggest: "idle" | "wait" | "on";
  draft?: string;
  logs: Log[];
  setPane: (p: DeskPane) => void;
  setRitual: (r: Ritual) => void;
  setBrand: (b: BrandId) => void;
  decide: (id: string, ok: boolean) => void;
  suggestGoal: () => void;
  applyGoal: () => void;
  draftFromKnow: () => void;
  saveHandoff: (text: string) => void;
};

export const usePurpose = create<PS>()((set, get) => ({
  pane: "desk",
  ritual: "morning",
  brand: "sun",
  approvals: SEED_APPROVALS,
  alerts: SEED_ALERTS,
  notes: ["09:12 네이버 12화면 추출 중", "비용 경고 구글 썬볼트"],
  savedHandoff: false,
  suggest: "idle",
  logs: [],
  setPane: (pane) => set({ pane }),
  setRitual: (ritual) => set({ ritual }),
  setBrand: (brand) => set({ brand }),
  decide: (id, ok) => {
    const seat = useFleet.getState().seat;
    const a = get().approvals.find((x) => x.id === id);
    if (!a) return;
    const next = decideApproval(a, seat, ok);
    const blocked = next.status === "wait" && seat !== "owner";
    set((s) => ({
      approvals: s.approvals.map((x) => (x.id === id ? next : x)),
      logs: [{ t: blocked ? "직원은 조회만 · 승인 불가" : `${a.title} · ${next.status}`, ok: !blocked }, ...s.logs].slice(0, 8),
    }));
  },
  suggestGoal: () => set({ suggest: "wait" }),
  applyGoal: () => {
    const seat = useFleet.getState().seat;
    if (seat !== "owner") {
      set((s) => ({ logs: [{ t: "목표 적용은 대표 승인", ok: false }, ...s.logs].slice(0, 8) }));
      return;
    }
    set((s) => ({ suggest: "on", logs: [{ t: "목표 적용 · 실행은 관찰만", ok: true }, ...s.logs].slice(0, 8) }));
  },
  draftFromKnow: () => {
    const brand = get().brand;
    const r = isolateDraft(brand, brand, `${BRANDS.find((b) => b.id === brand)?.name} 키워드 초안`);
    set((s) => ({
      draft: r.ok ? `${BRANDS.find((b) => b.id === brand)?.name} · 검색 의도 글 초안 (게시 안 함)` : undefined,
      logs: [{ t: r.why, ok: r.ok }, ...s.logs].slice(0, 8),
    }));
  },
  saveHandoff: (text) => {
    const r = handoffSafe(text);
    if (!r.ok) {
      set((s) => ({ logs: [{ t: "인수인계에 비밀 금지", ok: false }, ...s.logs].slice(0, 8) }));
      return;
    }
    set((s) => ({ savedHandoff: true, notes: [r.text, ...s.notes], logs: [{ t: "인수인계 저장", ok: true }, ...s.logs].slice(0, 8) }));
  },
}));
