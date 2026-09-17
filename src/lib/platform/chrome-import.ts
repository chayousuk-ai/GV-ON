import { canLogin, SITE_ALLOW } from "./host-access.ts";
import { refuseSecret } from "../adsops/gpus.ts";

export type ChromeKind = "bookmark" | "history" | "login" | "cookie";

export type ChromeRow = {
  kind: ChromeKind;
  host: string;
  title: string;
  url?: string;
};

export const CHROME_ROOT = {
  windows: "%LOCALAPPDATA%\\Google\\Chrome\\User Data",
  darwin: "~/Library/Application Support/Google/Chrome",
};

export const CHROME_FILES = ["Bookmarks", "History", "Login Data", "Cookies"];

/** 데모 스캔. 실기는 크롬 종료 후 이 파일 복사본을 읽음. */
export const SCAN: ChromeRow[] = [
  { kind: "bookmark", host: "ads.naver.com", title: "네이버 검색광고" },
  { kind: "bookmark", host: "ads.google.com", title: "구글 광고" },
  { kind: "bookmark", host: "www.youtube.com", title: "YouTube" },
  { kind: "history", host: "analytics.naver.com", title: "애널리틱스 일간" },
  { kind: "history", host: "ads.naver.com", title: "캠페인 목록" },
  { kind: "login", host: "ads.naver.com", title: "gvon.local" },
  { kind: "login", host: "ads.google.com", title: "gvon.local" },
  { kind: "login", host: "bank.example", title: "개인뱅킹" },
  { kind: "cookie", host: "ads.naver.com", title: "세션" },
  { kind: "cookie", host: "ads.google.com", title: "세션" },
  { kind: "cookie", host: "www.youtube.com", title: "세션" },
];

export function secretUrl(url?: string) {
  if (!url) return false;
  return /password=|passwd=|secret=|token=/i.test(url) || refuseSecret(url);
}

export function takeRow(row: ChromeRow, opts: { closed: boolean; grant: boolean }) {
  if (!opts.grant) return { ok: false, why: "크롬 프로필 읽기 권한 없음" };
  if (!opts.closed) return { ok: false, why: "크롬을 먼저 종료" };
  if (secretUrl(row.url) || refuseSecret(row.title)) return { ok: false, why: "비밀 질의 건너뜀" };
  if (row.kind === "login" || row.kind === "cookie") {
    const r = canLogin(row.host, true);
    if (!r.ok) return { ok: false, why: "허용 목록 아님 · 로그인·쿠키 안 옮김" };
  }
  if (row.kind === "login") return { ok: true, why: "금고 항목명만 · 암호 표시 없음" };
  if (row.kind === "cookie") return { ok: true, why: "작업 프로필만 · Grok 격리는 제외" };
  return { ok: true, why: row.kind === "bookmark" ? "즐겨찾기" : "기록 → Qdrant" };
}

export function planImport(rows: ChromeRow[], opts: { closed: boolean; grant: boolean }) {
  const decided = rows.map((row) => ({ row, ...takeRow(row, opts) }));
  const ok = decided.filter((d) => d.ok);
  const skip = decided.filter((d) => !d.ok);
  return {
    ok,
    skip,
    counts: {
      bookmark: ok.filter((d) => d.row.kind === "bookmark").length,
      history: ok.filter((d) => d.row.kind === "history").length,
      login: ok.filter((d) => d.row.kind === "login").length,
      cookie: ok.filter((d) => d.row.kind === "cookie").length,
    },
    allow: SITE_ALLOW.length,
  };
}
