import type { SurfaceId, WriteKind } from "./types";

export type WriteRec = { at: number; kind: WriteKind; portal: SurfaceId; hash: string };

export type PolicyHit = { at: number; code: string; ok: boolean; text: string };

export type Verdict = { ok: true } | { ok: false; code: string; reason: string };

export const RULES: { code: string; title: string; detail: string; source: string }[] = [
  {
    code: "OWN",
    title: "본인 계정만",
    detail: "타인·구매 계정, 허위 신원 증폭 금지. Meta Inauthentic Behavior.",
    source: "Meta Community Standards · Inauthentic Behavior",
  },
  {
    code: "NO-MACRO",
    title: "무단 매크로 없음",
    detail: "동의 없는 자동 가입·로그인·게시·수집·검색클릭 금지. 캡차 우회·IP 돌리기 없음.",
    source: "네이버 이용약관 · 자동화 수단",
  },
  {
    code: "NO-MGT",
    title: "검색 자동쿼리 없음",
    detail: "허가 없는 구글 검색 자동 질의·순위 스크랩은 machine-generated traffic.",
    source: "Google Search spam policies",
  },
  {
    code: "NO-REPEAT",
    title: "동일·대량 댓글 없음",
    detail: "같은 문구, 짧은 시간 대량, 링크 도배. YouTube comment spam.",
    source: "YouTube · Spam, deceptive practices",
  },
  {
    code: "NO-FAKE-ENG",
    title: "허위 참여 없음",
    detail: "좋아요·공감·조회 매크로, 클릭 조작. 네이버 허위클릭은 형사 처벌 사례.",
    source: "Naver / YouTube incentivization / Ads invalid traffic",
  },
  {
    code: "CAP",
    title: "쓰기 한도",
    detail: "댓글 면당 하루 2, 게시 1. 쓰기 사이 45분. 쓰기는 매번 L4.",
    source: "플랫폼 반복행위 탐지 기준에 맞춘 내부 한도",
  },
  {
    code: "CAPTCHA",
    title: "캡차는 사람",
    detail: "로봇 체크가 뜨면 중단. 솔버·우회 없음.",
    source: "네이버 약관 · 카카오 운영정책",
  },
];

const DAY = 86400000;
const GAP = 45 * 60 * 1000;

function today(recs: WriteRec[], portal: SurfaceId, kind: WriteKind) {
  const t0 = Date.now() - DAY;
  return recs.filter((r) => r.at >= t0 && r.portal === portal && r.kind === kind);
}

export function hashBody(s: string) {
  return s.replace(/\s+/g, " ").trim().slice(0, 180);
}

export function checkWrite(
  recs: WriteRec[],
  kind: WriteKind,
  portal: SurfaceId,
  body: string,
): Verdict {
  if (kind === "login" || kind === "logout") return { ok: true };
  if (kind === "pause" || kind === "budget") return { ok: true };

  const h = hashBody(body);
  if (h.length < 8) {
    return { ok: false, code: "NO-REPEAT", reason: "너무 짧은 쓰기. 템플릿 스팸으로 분류됩니다." };
  }
  if (recs.some((r) => r.hash === h && Date.now() - r.at < DAY)) {
    return { ok: false, code: "NO-REPEAT", reason: "24시간 내 동일 문구. YouTube/카페 반복 댓글 금지." };
  }
  const last = recs.filter((r) => r.kind === "comment" || r.kind === "post").sort((a, b) => b.at - a.at)[0];
  if (last && Date.now() - last.at < GAP) {
    return { ok: false, code: "CAP", reason: "쓰기 간격 45분 미만. 짧은 연속 게시는 봇으로 잡힙니다." };
  }
  if (kind === "comment" && today(recs, portal, "comment").length >= 2) {
    return { ok: false, code: "CAP", reason: `${portal} 댓글 하루 2건 한도.` };
  }
  if (kind === "post" && today(recs, portal, "post").length >= 1) {
    return { ok: false, code: "CAP", reason: `${portal} 게시 하루 1건 한도.` };
  }
  return { ok: true };
}

export function checkIntent(text: string): Verdict {
  if (/캡차\s*우회|captcha\s*(bypass|solver)|아이피\s*(우회|회전)|프록시\s*돌려/.test(text)) {
    return { ok: false, code: "CAPTCHA", reason: "캡차·IP 우회는 넣지 않습니다. 사람이 풉니다." };
  }
  if (/대량\s*댓글|댓글\s*도배|매크로|클릭\s*농장|허위\s*클릭|좋아요\s*자동|팔로우\s*자동|조회수\s*늘/.test(text)) {
    return { ok: false, code: "NO-FAKE-ENG", reason: "대량·허위 참여는 스팸/매크로입니다. 일정을 올리지 않습니다." };
  }
  if (/매시간\s*댓글|1분마다|초마다\s*게시/.test(text)) {
    return { ok: false, code: "NO-REPEAT", reason: "고빈도 쓰기는 반복 스팸입니다." };
  }
  return { ok: true };
}

export function checkCadence(write: boolean, everyMs?: number, expr?: string): Verdict {
  if (!write) return { ok: true };
  if (everyMs && everyMs < 6 * 3600000) {
    return { ok: false, code: "CAP", reason: "쓰기 반복은 6시간보다 짧을 수 없습니다." };
  }
  if (expr && /\* \* \*/.test(expr)) {
    return { ok: false, code: "CAP", reason: "쓰기 cron은 매일 1회까지." };
  }
  return { ok: true };
}
