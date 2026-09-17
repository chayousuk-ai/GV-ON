/** GPU0 = 이미 올린 Qwen·임베딩. GPU1 = 브라우저 추가 모델만. 비밀값은 모델에 안 넣음. */

export type GpuId = 0 | 1;

export type Job =
  | "brain"
  | "gate"
  | "vl-screen"
  | "embed"
  | "rerank"
  | "translate-text"
  | "ocr-box"
  | "translate-image"
  | "harvest-filter"
  | "harvest-judge"
  | "harvest-embed";

export type Slot = {
  id: string;
  gpu: GpuId;
  name: string;
  role: string;
  vramMb: number;
  ttl: "resident" | "idle-unload";
  optional?: boolean;
};

export const GPU0: Slot[] = [
  { id: "qwen3-8b", gpu: 0, name: "Qwen3-8B", role: "두뇌 · Hermes 내부", vramMb: 0, ttl: "resident" },
  { id: "qwen3-1.7b", gpu: 0, name: "Qwen3-1.7B", role: "문지기", vramMb: 0, ttl: "idle-unload" },
  { id: "qwen3-vl-2b", gpu: 0, name: "Qwen3-VL-2B", role: "화면 분석", vramMb: 0, ttl: "idle-unload" },
  { id: "bge-m3", gpu: 0, name: "BGE-M3", role: "한국어 임베딩", vramMb: 0, ttl: "resident" },
  { id: "qwen-emb-0.6", gpu: 0, name: "Qwen Emb 0.6B", role: "코드·스킬 임베딩", vramMb: 0, ttl: "resident" },
  { id: "qwen-rr-0.6", gpu: 0, name: "Qwen Rerank 0.6B", role: "리랭크", vramMb: 0, ttl: "resident" },
];

/** GPU1 32GB. 작은 전용 번역 + OCR. 7B는 끔이 기본. */
export const GPU1_POOL: Slot[] = [
  {
    id: "hy-mt-1.8",
    gpu: 1,
    name: "HY-MT1.5-1.8B",
    role: "텍스트 번역 zh·en·ko",
    vramMb: 2200,
    ttl: "idle-unload",
  },
  {
    id: "rapid-ocr",
    gpu: 1,
    name: "PP-OCRv4",
    role: "이미지 글자 박스 · 재생성 없음",
    vramMb: 500,
    ttl: "idle-unload",
  },
  {
    id: "hy-mt-7b",
    gpu: 1,
    name: "HY-MT1.5-7B",
    role: "번역 품질 옵션",
    vramMb: 8500,
    ttl: "idle-unload",
    optional: true,
  },
  {
    id: "qwen3-30b-a3b",
    gpu: 1,
    name: "Qwen3-30B-A3B",
    role: "선별·중요도 · 활성 3B",
    vramMb: 18000,
    ttl: "idle-unload",
    optional: true,
  },
];

export const GPU1_VRAM = 32768;

export function route(job: Job): { gpu: GpuId; model: string } {
  switch (job) {
    case "brain":
      return { gpu: 0, model: "qwen3-8b" };
    case "gate":
      return { gpu: 0, model: "qwen3-1.7b" };
    case "vl-screen":
      return { gpu: 0, model: "qwen3-vl-2b" };
    case "embed":
      return { gpu: 0, model: "bge-m3" };
    case "rerank":
      return { gpu: 0, model: "qwen-rr-0.6" };
    case "translate-text":
      return { gpu: 1, model: "hy-mt-1.8" };
    case "ocr-box":
      return { gpu: 1, model: "rapid-ocr" };
    case "translate-image":
      return { gpu: 1, model: "hy-mt-1.8" };
    case "harvest-filter":
      return { gpu: 0, model: "qwen3-8b" };
    case "harvest-embed":
      return { gpu: 0, model: "bge-m3" };
    case "harvest-judge":
      return { gpu: 1, model: "qwen3-30b-a3b" };
  }
}

export function usedMb(loaded: string[]) {
  return GPU1_POOL.filter((s) => loaded.includes(s.id)).reduce((n, s) => n + s.vramMb, 0);
}

export function canLoad(loaded: string[], id: string) {
  const slot = GPU1_POOL.find((s) => s.id === id);
  if (!slot) return false;
  if (loaded.includes(id)) return true;
  return usedMb(loaded) + slot.vramMb <= GPU1_VRAM;
}

export function refuseSecret(text: string) {
  return /비밀번호|password|secret|api[_-]?key/i.test(text);
}
