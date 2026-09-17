import { checkCadence, checkIntent } from "./policy";

export type CadenceKind = "once" | "every" | "cron";

export type Cadence = {
  kind: CadenceKind;
  label: string;
  expr?: string;
  everyMs?: number;
};

export type Bot = {
  id: string;
  name: string;
  job: string;
  skills: string[];
  l4: boolean;
};

export type ChatMsg = {
  id: string;
  role: "user" | "hermes" | "system";
  text: string;
  at: number;
};

export type BotFile = {
  id: string;
  name: string;
  bytes: number;
  excerpt: string;
};

export type JobStatus = "queued" | "running" | "waiting-l4" | "done" | "paused";

export type Job = {
  id: string;
  botId: string;
  title: string;
  prompt: string;
  cadence: Cadence;
  skillHint: string;
  isolated: true;
  status: JobStatus;
  nextAt: number;
  lastLog?: string;
};

export type Plan = {
  title: string;
  method: string;
  skillHint: string;
  cadence: Cadence;
  l4: boolean;
  checkpoint: string;
  session: string;
  blocked?: string;
};

export const SEED_BOTS: Bot[] = [
  {
    id: "collect",
    name: "수집봇",
    job: "포털·SNS에서 읽고 저장. 쓰기는 하지 않음.",
    skills: ["harvest", "yt-harvest", "nads-relkw"],
    l4: false,
  },
  {
    id: "ads",
    name: "광고봇",
    job: "광고·분석 리포트. 중지·예산은 초안만.",
    skills: ["gads-mcp-read", "gads-pause", "ga4-report"],
    l4: true,
  },
  {
    id: "publish",
    name: "발행봇",
    job: "카페·담벼락 초안. 발행은 매번 L4.",
    skills: ["compose", "fb-post"],
    l4: true,
  },
];

export function hermesPlan(text: string, files: BotFile[]): Plan {
  const t = text;
  const ads = /광고|캠페인|소진|GAQL|입찰/.test(t);
  const analytics = /분석|세션|GA4|어드바이저/.test(t);
  const write = /발행|댓글|중지|예산|게시/.test(t);
  const daily = /매일|daily/.test(t);
  const weekdays = /평일|weekday/.test(t);
  const weekly = /매주/.test(t);
  const now = /지금|즉시|한번만|한 번/.test(t);

  let cadence: Cadence;
  if (now) cadence = { kind: "once", label: "일시 · 지금" };
  else if (daily) cadence = { kind: "cron", label: "정기 · 매일 09:00 KST", expr: "0 9 * * *" };
  else if (weekdays) cadence = { kind: "cron", label: "반복 · 평일 09:00 KST", expr: "0 9 * * 1-5" };
  else if (weekly) cadence = { kind: "cron", label: "반복 · 매주 월 09:00", expr: "0 9 * * 1" };
  else if (/매시간|1시간/.test(t)) cadence = { kind: "every", label: "반복 · 1시간", everyMs: 3600000 };
  else cadence = { kind: "once", label: "일시 · 지금 (일정 미지정)" };

  const skillHint = ads ? "gads-mcp-read" : analytics ? "ga4-report" : write ? "compose" : "harvest";
  const method = ads
    ? "API 읽기(GAQL) 우선. 셀렉터 실패 시 GUI L1→L3."
    : analytics
      ? "GA4 run_report. 네이버 분석은 GUI 파싱."
      : write
        ? "에디터 L1, 발행 전 검사점·L4."
        : "검색→클릭→본문 저장. Qdrant upsert.";

  const fileNote = files.length ? `첨부 ${files.map((f) => f.name).join(", ")}를 컨텍스트로 사용.` : "첨부 없음.";
  const intent = checkIntent(t);
  const cad = checkCadence(write, cadence.everyMs, cadence.expr);
  const blocked = !intent.ok ? intent.reason : !cad.ok ? cad.reason : undefined;

  return {
    title: t.slice(0, 42) || "작업",
    method: blocked ? `거절. ${blocked}` : `${method} ${fileNote}`,
    skillHint: blocked ? "policy" : skillHint,
    cadence: blocked ? { kind: "once", label: "거절 · 일정 없음" } : cadence,
    l4: write && !blocked,
    checkpoint: blocked ? "정책 실드. job 안 올림." : write ? "로그인·mutate·발행 전 검사점. Vault만 자격증명." : "읽기만. 검사점 생략.",
    session: "isolated · cron:<job> · Hermes wake(sessionId)",
    blocked,
  };
}

export function nextAt(cadence: Cadence, now = Date.now()) {
  if (cadence.kind === "once") return now + 1600;
  if (cadence.kind === "every") return now + Math.min(cadence.everyMs ?? 60000, 8000);
  return now + 8000;
}

export function cadenceAdvance(cadence: Cadence, from: number) {
  if (cadence.kind === "once") return from;
  if (cadence.kind === "every") return from + (cadence.everyMs ?? 3600000);
  return from + 24 * 3600 * 1000;
}
