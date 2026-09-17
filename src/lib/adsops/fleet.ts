import { refuseSecret, type Job } from "./gpus.ts";

export type Seat = "owner" | "staff";
export type Place = "local" | "studio" | "none";

export const STAFF_GPU = { name: "Titan XP", vramMb: 12288 };

/** 직원 12GB에 올라가는 것. 30B는 안 됨. */
export const STAFF_LOCAL: Partial<Record<Job, string>> = {
  brain: "qwen3-8b",
  gate: "qwen3-1.7b",
  "vl-screen": "qwen3-vl-2b",
  embed: "bge-m3",
  rerank: "qwen-rr-0.6",
  "harvest-filter": "qwen3-8b",
  "harvest-embed": "bge-m3",
  "translate-text": "hy-mt-1.8",
  "ocr-box": "rapid-ocr",
  "translate-image": "hy-mt-1.8",
};

export const STUDIO = {
  name: "Mac Studio M1 Ultra 128GB",
  host: "gvon-studio",
  mesh: "Tailscale",
  ramGb: 128,
  models: ["qwen3-30b-a3b", "qwen3-8b", "hy-mt-1.8", "bge-m3", "qwen3-vl-2b"],
  kb: ["ads", "sales", "ops", "marketing"],
};

export function staffFits(job: Job) {
  return job in STAFF_LOCAL && job !== "harvest-judge";
}

export function pickPlace(opts: {
  seat: Seat;
  job: Job;
  localOn: boolean;
  studioOn: boolean;
  prompt?: string;
}): { place: Place; where: string; why: string } {
  if (opts.prompt && refuseSecret(opts.prompt)) {
    return { place: "none", where: "—", why: "1급 · 모델·스튜디오 모두 차단" };
  }
  if (opts.seat === "owner" && opts.localOn) {
    if (opts.job === "harvest-judge") return { place: "local", where: "GPU1 30B-A3B", why: "대표 PC" };
    return { place: "local", where: "GPU0/1", why: "대표 PC 로컬 우선" };
  }
  if (opts.seat === "staff" && opts.localOn && staffFits(opts.job)) {
    return { place: "local", where: `Titan XP · ${STAFF_LOCAL[opts.job]}`, why: "직원 로컬 우선" };
  }
  if (opts.studioOn) {
    return { place: "studio", where: `${STUDIO.host} · Tailscale`, why: "로컬 없음·용량 부족 → 회사 스튜디오" };
  }
  return { place: "none", where: "—", why: "로컬 없음 · 스튜디오는 나중에 연결" };
}
