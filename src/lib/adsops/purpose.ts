import { refuseSecret } from "./gpus.ts";

export type BrandId = "sun" | "kpack" | "ktech" | "gp" | "sunon";
export type Ritual = "morning" | "noon" | "close";
export type Seat = "owner" | "staff";
export type DeskPane = "desk" | "screens" | "inbox" | "handoff";

export const BRANDS: { id: BrandId; name: string }[] = [
  { id: "sun", name: "썬볼트" },
  { id: "kpack", name: "코리아팩" },
  { id: "ktech", name: "코리아텍" },
  { id: "gp", name: "굿프라이스" },
  { id: "sunon", name: "썬볼트온라인" },
];

export const RITUALS: { id: Ritual; label: string; items: string[] }[] = [
  { id: "morning", label: "아침", items: ["수집 로그", "애널리틱스 12화면", "비용 경고"] },
  { id: "noon", label: "정오", items: ["이상 재확인", "승인 대기"] },
  { id: "close", label: "마감", items: ["인수인계 저장", "지식만 남김"] },
];

export const CHAIN = [
  { id: "impr", label: "노출", now: 1240, goal: 1300, unit: "천" },
  { id: "click", label: "클릭", now: 184, goal: 200, unit: "백" },
  { id: "lead", label: "문의", now: 96, goal: 120, unit: "건" },
  { id: "rev", label: "매출판단", now: 48, goal: 60, unit: "지수" },
];

export type Approval = {
  id: string;
  brand: BrandId;
  kind: "bid" | "onoff" | "goal";
  title: string;
  status: "wait" | "ok" | "no";
};

export const SEED_APPROVALS: Approval[] = [
  { id: "a1", brand: "sun", kind: "bid", title: "검색 입찰 +10원", status: "wait" },
  { id: "a2", brand: "gp", kind: "onoff", title: "배너 캠페인 OFF", status: "wait" },
  { id: "a3", brand: "sun", kind: "goal", title: "주간 문의 목표 120 적용", status: "wait" },
];

export const SEED_ALERTS = [
  { id: "c1", title: "구글 썬볼트 비용 +12%", level: "warn" as const },
  { id: "c2", title: "기간 불일치 화면 0", level: "ok" as const },
];

export function brandName(id: BrandId) {
  return BRANDS.find((b) => b.id === id)?.name ?? id;
}

export function canApprove(seat: Seat) {
  return seat === "owner";
}

export function decideApproval(a: Approval, seat: Seat, ok: boolean): Approval {
  if (!canApprove(seat)) return { ...a, status: "wait" };
  return { ...a, status: ok ? "ok" : "no" };
}

export function isolateDraft(selected: BrandId, draftBrand: BrandId, text: string) {
  if (refuseSecret(text)) return { ok: false, why: "1급 · 초안에 비밀 금지" };
  if (selected !== draftBrand) return { ok: false, why: "브랜드 분리 · 다른 계정에 안 씀" };
  return { ok: true, why: "초안만 · 게시는 승인 후" };
}

export function handoffSafe(note: string) {
  if (refuseSecret(note)) return { ok: false, text: "" };
  return { ok: true, text: note };
}

export function ritualProgress(ritual: Ritual, opts: { extracts: number; approvalsWait: number; handoff: boolean }) {
  if (ritual === "morning") return { need: 12, have: Math.min(opts.extracts, 12), done: opts.extracts >= 12 };
  if (ritual === "noon") return { need: 0, have: opts.approvalsWait, done: opts.approvalsWait === 0 };
  return { need: 1, have: opts.handoff ? 1 : 0, done: opts.handoff };
}
