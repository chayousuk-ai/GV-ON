import type { HostId } from "./contract";

export type Kind = "os" | "file" | "app" | "ai" | "site";
export type How = "auto" | "you";

export type Cap = {
  id: string;
  kind: Kind;
  label: string;
  how: How;
  win: string;
  mac: string;
};

export const CAPS: Cap[] = [
  {
    id: "a11y",
    kind: "os",
    label: "화면·창 읽기",
    how: "you",
    win: "설정 → 접근성 → UI Automation에 GV-ON 허용",
    mac: "손쉬운 사용에 GV-ON 허용",
  },
  {
    id: "input",
    kind: "os",
    label: "키보드·마우스 L4",
    how: "you",
    win: "일반 사용자로 실행. 입력은 승인 후에만 SendInput",
    mac: "손쉬운 사용 허용 후 CGEvent. 승인 후만",
  },
  {
    id: "files",
    kind: "file",
    label: "폴더 읽기",
    how: "auto",
    win: "허용한 폴더만. 기본: 광고 정기업무 · Downloads · GV-ON 데이터",
    mac: "같은 목록. 전체 디스크는 나중에 TCC",
  },
  {
    id: "excel",
    kind: "file",
    label: "엑셀 쓰기",
    how: "auto",
    win: "직접 안 씀. 기존 승인 도구만 호출 (S4)",
    mac: "동일",
  },
  {
    id: "kakaotalk",
    kind: "app",
    label: "카카오톡",
    how: "you",
    win: "카카오톡 실행해 두기. 공식 API 없음 → UI Automation. 내 채팅만, L4",
    mac: "카카오톡 맥 앱 + 손쉬운 사용",
  },
  {
    id: "telegram",
    kind: "app",
    label: "텔레그램",
    how: "you",
    win: "Telegram Desktop 실행. UI Automation. 내 대화만",
    mac: "동일",
  },
  {
    id: "lmstudio",
    kind: "ai",
    label: "로컬 모델",
    how: "auto",
    win: "LM Studio가 이미 켜져 있으면 localhost만. GPU0/1 라우팅",
    mac: "동일",
  },
  {
    id: "grok",
    kind: "ai",
    label: "Grok (로그인됨)",
    how: "you",
    win: "격리 프로필에 한 번 로그인. 작업용 크롬 쿠키는 허용 사이트만 가져옴. Grok 격리에는 안 넣음",
    mac: "동일",
  },
  {
    id: "claude",
    kind: "ai",
    label: "Claude / Codex",
    how: "you",
    win: "이미 로그인된 데스크톱·CLI를 실행만. 비밀번호 추출 없음",
    mac: "동일",
  },
  {
    id: "vault",
    kind: "site",
    label: "사이트 로그인",
    how: "auto",
    win: "허용 목록 + 금고 항목명만. 목록 밖은 비밀번호 안 씀",
    mac: "키체인 항목명. 같은 허용 목록",
  },
];

/** 이용 허락된 사이트만. 그 외 로그인은 거부. */
export const SITE_ALLOW = [
  "ads.naver.com",
  "analytics.naver.com",
  "ads.google.com",
  "analytics.google.com",
  "keywordad.kakao.com",
  "moment.kakao.com",
  "www.mobon.net",
  "www.i-boss.co.kr",
];

export const FILE_ALLOW = [
  "Documents/A-01) 광고_정기업무",
  "Downloads",
  "AppData/GV-ON",
];

export function hostOfUrl(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function canLogin(host: string, granted: boolean) {
  if (!granted) return { ok: false, why: "사이트 로그인 권한 없음" };
  const h = host.replace(/^www\./, "");
  if (!SITE_ALLOW.some((s) => s.replace(/^www\./, "") === h || h.endsWith(s.replace(/^www\./, "")))) {
    return { ok: false, why: "허용 목록 아님 · 비밀번호 안 씀" };
  }
  return { ok: true, why: "금고 항목명만 주입" };
}

export function canFile(path: string, write: boolean, granted: boolean) {
  if (!granted) return { ok: false, why: "폴더 권한 없음" };
  const ok = FILE_ALLOW.some((p) => path.includes(p) || path.endsWith(p));
  if (!ok) return { ok: false, why: "허용 폴더 밖" };
  if (write && /xlsx|xls|xlsm/i.test(path)) return { ok: false, why: "엑셀은 승인 도구만 (S4)" };
  return { ok: true, why: write ? "쓰기" : "읽기" };
}

export function canApp(id: string, granted: boolean, l4: boolean) {
  if (!granted) return { ok: false, why: "앱 권한 없음" };
  if ((id === "kakaotalk" || id === "telegram") && !l4) return { ok: false, why: "L4 승인 필요" };
  return { ok: true, why: "UIA" };
}

export function setupLines(host: HostId): { you: string[]; auto: string[] } {
  const you = CAPS.filter((c) => c.how === "you").map((c) => (host === "darwin" ? c.mac : c.win));
  const auto = CAPS.filter((c) => c.how === "auto").map((c) => (host === "darwin" ? c.mac : c.win));
  return { you, auto };
}
