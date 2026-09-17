/** 부록 F. 금고 항목명만. 비밀값 없음. */

export type LoginKind = "direct" | "switch" | "mcc";

export type Profile = {
  id: string;
  vault: string;
  media: string;
  brand: string;
  role: "조회만" | "전권";
  login: LoginKind;
  daily: boolean;
  note: string;
};

export const PROFILES: Profile[] = [
  {
    id: "naver-mgr",
    vault: "GV/네이버/썬볼트 — 검색광고·애널리틱스(레저·인더)",
    media: "네이버 검색광고",
    brand: "썬볼트 관리자",
    role: "조회만",
    login: "direct",
    daily: true,
    note: "로그인 후 운영 7계정 전환",
  },
  {
    id: "naver-ana",
    vault: "GV/네이버/썬볼트/애널리틱스",
    media: "네이버 애널리틱스",
    brand: "썬볼트배터리·코리아테크",
    role: "조회만",
    login: "direct",
    daily: true,
    note: "API 없음 · 12화면",
  },
  {
    id: "gads-mcc",
    vault: "GV/구글/썬볼트 — 광고·블로그(총괄)",
    media: "구글 애즈 MCC",
    brand: "글로벌비전 통합",
    role: "전권",
    login: "mcc",
    daily: true,
    note: "코리아팩·굿프라이스만 별도 로그인",
  },
  {
    id: "kakao-sun",
    vault: "GV/카카오/썬볼트/광고",
    media: "카카오 모먼트·키워드",
    brand: "썬볼트 그룹",
    role: "전권",
    login: "switch",
    daily: true,
    note: "공용 계정 진입 후 전환",
  },
  {
    id: "mobon",
    vault: "GV/모비온/썬볼트 — 배너·아이커버 광고",
    media: "모비온",
    brand: "썬볼트",
    role: "전권",
    login: "direct",
    daily: true,
    note: "캠페인명으로 5브랜드",
  },
];

export const SCREEN_SET = {
  id: "morning",
  title: "아침 브리핑",
  screens: 12,
  desc: "애널리틱스 2사이트 × 일·주·월 × 현황·체류",
};
