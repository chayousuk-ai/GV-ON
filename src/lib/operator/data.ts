import type { Article, SurfaceId, TaskDef } from "./types";

export const SURFACES: { id: SurfaceId; name: string; host: string; kind: "portal" | "sns" | "ads" | "analytics" | "shop" }[] = [
  { id: "naver", name: "네이버형 검색", host: "search.lab", kind: "portal" },
  { id: "google", name: "구글형 검색", host: "www.lab", kind: "portal" },
  { id: "kakao", name: "카카오형 카페", host: "cafe.lab", kind: "portal" },
  { id: "youtube", name: "영상랩 (YouTube 어댑터)", host: "watch.lab", kind: "sns" },
  { id: "facebook", name: "담벼락랩 (Facebook 어댑터)", host: "wall.lab", kind: "sns" },
  { id: "instagram", name: "포토랩 (Instagram 어댑터)", host: "photo.lab", kind: "sns" },
  { id: "tiktok", name: "클립랩 (TikTok 어댑터)", host: "clip.lab", kind: "sns" },
  { id: "community", name: "게시판랩 (커뮤니티)", host: "board.lab", kind: "sns" },
  { id: "gads", name: "구글광고 랩", host: "ads.lab", kind: "ads" },
  { id: "nads", name: "네이버검색광고 랩", host: "searchad.lab", kind: "ads" },
  { id: "kmoment", name: "카카오모먼트 랩", host: "moment.lab", kind: "ads" },
  { id: "metaads", name: "메타광고 랩", host: "adsmanager.lab", kind: "ads" },
  { id: "ga4", name: "GA4 랩", host: "analytics.lab", kind: "analytics" },
  { id: "nstat", name: "네이버분석 랩", host: "stat.lab", kind: "analytics" },
  { id: "ali1688", name: "1688형 도매 랩", host: "s.1688.lab", kind: "shop" },
];

export const PORTALS = SURFACES;

export const TASKS: TaskDef[] = [
  {
    id: "harvest",
    title: "검색 · 클릭 · 본문 저장",
    blurb: "포털에서 글을 열고 파싱해 저장. 쓰기 없음.",
    portal: "naver",
    keyword: "로컬 VL 에이전트",
    deviceId: "pc-1440",
  },
  {
    id: "yt-harvest",
    title: "영상 검색 · 시청 · 캡션 저장",
    blurb: "YouTube 어댑터. 영상 카드 클릭 후 설명 파싱.",
    portal: "youtube",
    keyword: "로컬 VL 데모",
    deviceId: "pc-1440",
  },
  {
    id: "ig-comment",
    title: "포토 피드 댓글",
    blurb: "Instagram 어댑터. 모바일 뷰에서 댓글. 등록은 L4.",
    portal: "instagram",
    write: "comment",
    deviceId: "mob-390",
  },
  {
    id: "tt-scan",
    title: "클립 전면 VL (모바일)",
    blurb: "TikTok 어댑터. 390×844에서 SoM·좌표 스캔.",
    portal: "tiktok",
    deviceId: "mob-390",
  },
  {
    id: "fb-post",
    title: "담벼락 초안 · 게시",
    blurb: "Facebook 어댑터. 게시는 L4. 대량 루틴 없음.",
    portal: "facebook",
    write: "post",
    deviceId: "pc-1440",
  },
  {
    id: "compose",
    title: "카페 로그인 후 글 발행",
    blurb: "autofill 후 에디터. 발행은 L4.",
    portal: "kakao",
    write: "post",
    deviceId: "pc-1440",
  },
  {
    id: "adapt",
    title: "유사 작업 응용",
    blurb: "저장된 검색을 다른 면(구글/커뮤니티)에 변형.",
    portal: "community",
    keyword: "Qdrant 하이브리드 검색",
    deviceId: "tab-768",
  },
  {
    id: "ali-tr",
    title: "1688 텍스트·이미지 번역",
    blurb: "중국어 상세. 텍스트 스킬 + 이미지 레이어(웨일식).",
    portal: "ali1688",
    deviceId: "pc-1440",
    page: "search",
  },
  {
    id: "spam-try",
    title: "대량 댓글 시도 (거절)",
    blurb: "스팸 패턴. 실행 안 함. 정책 실드가 막습니다.",
    portal: "instagram",
    write: "comment",
    deviceId: "mob-390",
  },
];

export const CORPUS: Record<SurfaceId, Article[]> = {
  naver: [
    {
      id: "n1",
      title: "로컬 VL로 화면을 읽는 브라우저 에이전트",
      source: "랩 블로그",
      body: "DOM이 없는 캔버스 광고는 셀렉터가 비습니다. 스크린샷과 Set-of-Marks가 필요합니다.",
    },
    {
      id: "n2",
      title: "네이버 카페 글쓰기 UX 메모",
      source: "AX 노트",
      body: "에디터는 iframe인 경우가 많습니다. L1 실패 시 VL이 등록 버튼을 번호로 가리킵니다.",
    },
    {
      id: "n3",
      title: "AX 브라우저와 반복 수집",
      source: "주간 로그",
      body: "수집은 루틴, 댓글·발행은 매번 승인. 비슷한 키워드는 playbook을 변형합니다.",
    },
  ],
  google: [
    {
      id: "g1",
      title: "Computer-use agents: screenshot, grid, click",
      source: "Papers",
      body: "논리 해상도를 고정하면 좌표 playbook이 재사용됩니다. GV-ON 기본은 1440×900.",
    },
    {
      id: "g2",
      title: "Qdrant 하이브리드 검색",
      source: "Docs",
      body: "한국어 본문은 BGE-M3, 셀렉터는 Qwen embedding.",
    },
    {
      id: "g3",
      title: "UI-TARS and local VL endpoints",
      source: "Lab",
      body: "OpenAI 호환 멀티모달 엔드포인트만 있으면 됩니다.",
    },
  ],
  kakao: [
    {
      id: "k1",
      title: "카페 공지 초안 가이드",
      source: "카페랩",
      body: "제목 40자, 본문은 사실만. 자동 발행 금지.",
    },
    {
      id: "k2",
      title: "댓글 예절",
      source: "카페랩",
      body: "동일 문구 반복은 차단 대상. GV-ON은 대량 댓글 루틴을 저장하지 않습니다.",
    },
  ],
  youtube: [
    {
      id: "y1",
      title: "로컬 VL 데모 — 화면을 보고 클릭하기",
      source: "WatchLab",
      body: "설명란. 타임코드 0:12에서 버튼이 바뀝니다. 캡션 트랙을 ko_docs에 저장합니다.",
    },
    {
      id: "y2",
      title: "모바일 세로 플레이어 히트박스",
      source: "WatchLab",
      body: "390폭에서는 좋아요/댓글이 오른쪽 스택입니다. 디바이스 프리셋을 바꾸면 SoM이 다시 찍힙니다.",
    },
  ],
  facebook: [
    {
      id: "f1",
      title: "주간 AX 메모",
      source: "WallLab",
      body: "수집 요약만 초안으로. 친구 태그와 페이지 게시는 L4.",
    },
    {
      id: "f2",
      title: "그룹 공지 초안",
      source: "WallLab",
      body: "링크 프리뷰가 캔버스면 L3. 비밀번호는 피드 스크린샷에서 자릅니다.",
    },
  ],
  instagram: [
    {
      id: "i1",
      title: "스튜디오 조명 테스트",
      source: "PhotoLab",
      body: "캐러셀 2/3. 댓글창은 하단 시트. 모바일 UA에서만 레이아웃이 맞습니다.",
    },
    {
      id: "i2",
      title: "스토리형 카드",
      source: "PhotoLab",
      body: "스토리 진행 바. 탭 영역이 넓어 클릭 난수를 박스 안 40–60%로 둡니다.",
    },
  ],
  tiktok: [
    {
      id: "t1",
      title: "세로 클립 01",
      source: "ClipLab",
      body: "전체 화면 클립. 오른쪽 액션 스택, 하단 캡션. PC 뷰포트면 레이아웃이 깨지니 모바일 프리셋 고정.",
    },
    {
      id: "t2",
      title: "세로 클립 02",
      source: "ClipLab",
      body: "사운드 칩이 오버레이. DOM 히트 실패 시 VL 번호로 승격.",
    },
  ],
  community: [
    {
      id: "c1",
      title: "Qdrant 하이브리드 검색 후기",
      source: "BoardLab",
      body: "포털에서 저장한 extract를 게시판 검색어로 재사용. 셀렉터는 새로 찍음.",
    },
    {
      id: "c2",
      title: "모바일 글쓰기 폭",
      source: "BoardLab",
      body: "360폭에서 에디터가 풀폭. 태블릿은 2열.",
    },
  ],
  gads: [
    { id: "ga1", title: "GAQL 주간 소진", source: "AdsLab", body: "캠페인별 cost_micros, clicks, impressions. 읽기는 MCP search." },
  ],
  nads: [
    { id: "na1", title: "파워링크 주간", source: "SearchAdLab", body: "StatReport 비동기 생성 후 다운로드." },
  ],
  kmoment: [
    { id: "ka1", title: "모먼트 전환", source: "MomentLab", body: "비즈보드×전환. 리포트 rate limit 5초 1회." },
  ],
  metaads: [
    { id: "ma1", title: "피드 전환", source: "MetaLab", body: "인사이트는 읽기. 생성은 PAUSED." },
  ],
  ga4: [
    { id: "z1", title: "채널 그룹", source: "GA4Lab", body: "sessionDefaultChannelGroup × sessions." },
  ],
  nstat: [
    { id: "s1", title: "검색 성과", source: "StatLab", body: "서치어드바이저 노출·클릭. GUI 파싱." },
  ],
  ali1688: [
    {
      id: "a1",
      title: "纯棉短袖 T恤",
      source: "厂家直销",
      body: "材质纯棉. 起订量1件. 一件代发. 包邮.",
    },
    {
      id: "a2",
      title: "现货 批发价",
      source: "找货源",
      body: "颜色 白色 黑色. 尺码：M-4XL.",
    },
  ],
};
