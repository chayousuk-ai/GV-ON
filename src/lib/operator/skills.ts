import type { SurfaceId, WriteKind } from "./types";

export type SkillPack = "gads" | "nads" | "kakao" | "meta" | "ga4" | "nstat";

export type Playbook = "report" | "pause" | "budget" | "keywords" | "ga4" | "setup";

export type Skill = {
  id: string;
  pack: SkillPack;
  title: string;
  blurb: string;
  surface: SurfaceId;
  playbook: Playbook;
  write?: WriteKind;
  path: "api" | "gui" | "hybrid";
  source: string;
  tools: string[];
};

export const PACKS: { id: SkillPack; label: string }[] = [
  { id: "gads", label: "구글 광고" },
  { id: "nads", label: "네이버 광고" },
  { id: "kakao", label: "카카오 광고" },
  { id: "meta", label: "메타 광고" },
  { id: "ga4", label: "구글 분석" },
  { id: "nstat", label: "네이버 분석" },
];

export const SKILLS: Skill[] = [
  {
    id: "gads-mcp-read",
    pack: "gads",
    title: "계정·GAQL 조회",
    blurb: "공식 MCP. list_accessible_customers / search / metadata. 읽기만.",
    surface: "gads",
    playbook: "report",
    path: "api",
    source: "googleads/google-ads-mcp",
    tools: ["list_accessible_customers", "search", "get_resource_metadata"],
  },
  {
    id: "gads-mcp-setup",
    pack: "gads",
    title: "Ads MCP 셋업",
    blurb: "공식 에이전트 스킬. 로컬 인증·개발자 토큰 안내.",
    surface: "gads",
    playbook: "setup",
    path: "api",
    source: "google-ads-api-mcp-setup",
    tools: ["google-ads-api-mcp-setup", "google-ads-api-quickstart"],
  },
  {
    id: "gads-search-terms",
    pack: "gads",
    title: "검색어 · 제외키워드 후보",
    blurb: "search_terms_report. 제외 추가는 초안 후 L4.",
    surface: "gads",
    playbook: "keywords",
    write: "budget",
    path: "hybrid",
    source: "google-ads-api-mcp / GAQL",
    tools: ["search_terms_report", "add_negative_keywords"],
  },
  {
    id: "gads-pause",
    pack: "gads",
    title: "캠페인 일시중지 초안",
    blurb: "라이브 mutate 금지. 초안 저장 후 승인. AdKit 패턴.",
    surface: "gads",
    playbook: "pause",
    write: "pause",
    path: "hybrid",
    source: "Ads API mutate + L4",
    tools: ["set_campaign_status", "validate_only"],
  },
  {
    id: "gads-budget",
    pack: "gads",
    title: "일 예산 변경 초안",
    blurb: "공유 예산은 거절. 금액은 사람이 확인.",
    surface: "gads",
    playbook: "budget",
    write: "budget",
    path: "api",
    source: "Google Ads API CampaignBudget",
    tools: ["set_campaign_budget"],
  },
  {
    id: "nads-campaigns",
    pack: "nads",
    title: "검색광고 캠페인 목록",
    blurb: "Naver SearchAd API. 캠페인/그룹/소재.",
    surface: "nads",
    playbook: "report",
    path: "api",
    source: "naver/searchad-apidoc · packative/naver-searchad-mcp",
    tools: ["list_campaigns", "list_adgroups", "list_ads"],
  },
  {
    id: "nads-stats",
    pack: "nads",
    title: "대용량 성과 리포트",
    blurb: "Stat Report 다운로드 후 파싱·저장.",
    surface: "nads",
    playbook: "report",
    path: "api",
    source: "SearchAd StatReport",
    tools: ["create_stat_report", "download_stat_report"],
  },
  {
    id: "nads-relkw",
    pack: "nads",
    title: "연관검색 키워드 도구",
    blurb: "월간 QC, CTR, 경쟁지수. 본인 계정 키만.",
    surface: "nads",
    playbook: "keywords",
    path: "api",
    source: "SearchAd RelKwdStat",
    tools: ["related_keyword"],
  },
  {
    id: "nads-pause",
    pack: "nads",
    title: "그룹·키워드 상태 변경",
    blurb: "ON/OFF는 L4. 대량 삭제는 파일 확인 후.",
    surface: "nads",
    playbook: "pause",
    write: "pause",
    path: "hybrid",
    source: "SearchAd Adgroup/AdKeyword update",
    tools: ["update_adgroup", "update_keyword"],
  },
  {
    id: "kakao-accounts",
    pack: "kakao",
    title: "모먼트 광고계정·잔액",
    blurb: "비즈 토큰. 권한 심사 통과 계정만.",
    surface: "kmoment",
    playbook: "report",
    path: "api",
    source: "Kakao Moment OpenAPI v4",
    tools: ["adAccounts/pages", "adAccounts/balance", "adAccounts/trackers"],
  },
  {
    id: "kakao-campaigns",
    pack: "kakao",
    title: "모먼트 캠페인 조회",
    blurb: "Type×Goal, 일예산, 시스템 정지 사유.",
    surface: "kmoment",
    playbook: "report",
    path: "api",
    source: "apis.moment.kakao.com",
    tools: ["campaigns", "adGroups", "creatives"],
  },
  {
    id: "kakao-report",
    pack: "kakao",
    title: "모먼트 계층 리포트",
    blurb: "계정/캠페인/그룹/소재. rate limit 준수.",
    surface: "kmoment",
    playbook: "report",
    path: "api",
    source: "Moment report endpoints",
    tools: ["adAccounts/report", "campaigns/report", "creatives/report"],
  },
  {
    id: "kakao-onoff",
    pack: "kakao",
    title: "캠페인 ON/OFF",
    blurb: "1초 1회 제한. L4 없으면 호출 안 함.",
    surface: "kmoment",
    playbook: "pause",
    write: "pause",
    path: "api",
    source: "campaigns/onOff",
    tools: ["campaigns/onOff", "adGroups/onOff"],
  },
  {
    id: "kakao-keyword-gui",
    pack: "kakao",
    title: "키워드광고 콘솔 (GUI)",
    blurb: "키워드광고는 MCP가 얇음. 브라우저 L1–L4.",
    surface: "kmoment",
    playbook: "keywords",
    path: "gui",
    source: "keywordad.kakao.com 경로",
    tools: ["gui.login", "gui.keyword_tool"],
  },
  {
    id: "meta-insights",
    pack: "meta",
    title: "캠페인 인사이트",
    blurb: "spend, CTR, CPC, ROAS. Marketing API.",
    surface: "metaads",
    playbook: "report",
    path: "api",
    source: "Meta Marketing API · meta-ads-mcp",
    tools: ["get_campaigns", "get_campaign_performance", "get_ad_accounts"],
  },
  {
    id: "meta-pacing",
    pack: "meta",
    title: "예산 페이싱",
    blurb: "일 소진 속도. 초과 시 알림만, 변경은 L4.",
    surface: "metaads",
    playbook: "report",
    path: "api",
    source: "budget pacing tools",
    tools: ["get_budget_status"],
  },
  {
    id: "meta-breakdown",
    pack: "meta",
    title: "연령·성별 분해",
    blurb: "오디언스 브레이크다운.",
    surface: "metaads",
    playbook: "report",
    path: "api",
    source: "insights breakdowns",
    tools: ["get_audience_breakdown"],
  },
  {
    id: "meta-create-paused",
    pack: "meta",
    title: "캠페인 초안 (PAUSED)",
    blurb: "Digitizers/OpenClaw 규칙. 생성은 정지 상태만.",
    surface: "metaads",
    playbook: "budget",
    write: "budget",
    path: "api",
    source: "Digitizers/meta-ads-mcp",
    tools: ["create_campaign", "create_adset", "create_ad"],
  },
  {
    id: "meta-pause",
    pack: "meta",
    title: "광고 일시중지",
    blurb: "ACTIVE → PAUSED. L4.",
    surface: "metaads",
    playbook: "pause",
    write: "pause",
    path: "hybrid",
    source: "Marketing API campaign update",
    tools: ["update_campaign", "update_ad"],
  },
  {
    id: "ga4-report",
    pack: "ga4",
    title: "표준 리포트",
    blurb: "sessions, activeUsers, channel. Data API.",
    surface: "ga4",
    playbook: "ga4",
    path: "api",
    source: "googleanalytics/google-analytics-mcp",
    tools: ["run_report", "get_custom_dimensions_and_metrics"],
  },
  {
    id: "ga4-realtime",
    pack: "ga4",
    title: "실시간 30분",
    blurb: "run_realtime_report.",
    surface: "ga4",
    playbook: "ga4",
    path: "api",
    source: "GA4 Realtime API",
    tools: ["run_realtime_report"],
  },
  {
    id: "ga4-traffic",
    pack: "ga4",
    title: "트래픽 급락 진단",
    blurb: "channel-acquisition + traffic-diagnosis 플레이북.",
    surface: "ga4",
    playbook: "ga4",
    path: "api",
    source: "surendranb/google-analytics-mcp skills",
    tools: ["traffic-diagnosis", "channel-acquisition"],
  },
  {
    id: "ga4-ads-link",
    pack: "ga4",
    title: "Ads 링크 확인",
    blurb: "GA4 속성 ↔ Google Ads 연결.",
    surface: "ga4",
    playbook: "ga4",
    path: "api",
    source: "GA Admin API",
    tools: ["list_google_ads_links", "get_account_summaries"],
  },
  {
    id: "nstat-overview",
    pack: "nstat",
    title: "애널리틱스 개요 (GUI)",
    blurb: "공개 MCP 없음. 콘솔 클릭·캡처·파싱.",
    surface: "nstat",
    playbook: "ga4",
    path: "gui",
    source: "analytics.naver.com 경로",
    tools: ["gui.overview", "gui.export"],
  },
  {
    id: "nstat-advisor",
    pack: "nstat",
    title: "서치어드바이저",
    blurb: "색인·검색 성과. GUI + 일부 웹마스터 API.",
    surface: "nstat",
    playbook: "ga4",
    path: "hybrid",
    source: "searchadvisor.naver.com",
    tools: ["gui.search_performance", "webmaster.stat"],
  },
];

export type Campaign = {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED";
  spend: number;
  clicks: number;
  impr: number;
};

export const CAMPAIGNS: Partial<Record<SurfaceId, Campaign[]>> = {
  gads: [
    { id: "gc1", name: "브랜드 검색", status: "ENABLED", spend: 428000, clicks: 912, impr: 44100 },
    { id: "gc2", name: "경쟁 키워드", status: "ENABLED", spend: 219000, clicks: 340, impr: 18820 },
    { id: "gc3", name: "리마케팅", status: "PAUSED", spend: 0, clicks: 0, impr: 0 },
  ],
  nads: [
    { id: "nc1", name: "파워링크 · AX", status: "ENABLED", spend: 186000, clicks: 540, impr: 22100 },
    { id: "nc2", name: "쇼핑검색", status: "ENABLED", spend: 97000, clicks: 210, impr: 9800 },
  ],
  kmoment: [
    { id: "kc1", name: "비즈보드 전환", status: "ENABLED", spend: 152000, clicks: 880, impr: 120400 },
    { id: "kc2", name: "디스플레이 방문", status: "ENABLED", spend: 64000, clicks: 410, impr: 88000 },
  ],
  metaads: [
    { id: "mc1", name: "전환 · 피드", status: "ENABLED", spend: 310000, clicks: 1420, impr: 210000 },
    { id: "mc2", name: "도달 · 스토리", status: "PAUSED", spend: 12000, clicks: 40, impr: 9000 },
  ],
};

export const KEYWORDS = [
  { kw: "로컬 VL 에이전트", qc: 1200, ctr: 3.1, bid: 420 },
  { kw: "AX 브라우저", qc: 880, ctr: 2.4, bid: 360 },
  { kw: "검색광고 자동화", qc: 2400, ctr: 1.1, bid: 890 },
];

export const GA_ROWS = [
  { ch: "Organic Search", sessions: 4200, conv: 38 },
  { ch: "Paid Search", sessions: 1680, conv: 51 },
  { ch: "Paid Social", sessions: 940, conv: 12 },
  { ch: "Direct", sessions: 2100, conv: 9 },
];
