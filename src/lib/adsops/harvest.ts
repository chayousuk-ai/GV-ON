/** 공개 게시만. 로그인 벽·스팸 게시 없음. */

export type BoardId = "hot" | "share" | "qna" | "viral" | "comm";

export type Post = {
  id: string;
  board: BoardId;
  title: string;
  author: string;
  at: string;
  body: string;
  url: string;
};

export type Verdict = "skip" | "keep" | "update";

export type Hit = {
  post: Post;
  verdict: Verdict;
  why: string;
  score: number;
  fresh: number;
  near?: string;
  gpu: string;
};

export const BOARDS: { id: BoardId; label: string; trend: boolean }[] = [
  { id: "hot", label: "지금 인기", trend: true },
  { id: "share", label: "정보공유", trend: false },
  { id: "qna", label: "질문답변", trend: false },
  { id: "viral", label: "바이럴", trend: false },
  { id: "comm", label: "커뮤니티", trend: false },
];

export const MENUS = ["지금 인기", "주간 인기", "월간 인기", "정보공유", "질문답변", "바이럴", "커뮤니티", "여기익게"];

/** 이미 Qdrant에 있는 지식(비교용). */
export const STORED: { id: string; title: string; at: string; body: string }[] = [
  {
    id: "s1",
    title: "구글 애즈 세팅 체크리스트",
    at: "2026-08-01",
    body: "전환 추적·전환값·PMAX 자산 점검",
  },
  {
    id: "s2",
    title: "네이버 플레이스 기본 최적화",
    at: "2026-07-10",
    body: "카테고리·사진·리뷰 응답",
  },
];

export const FEED: Post[] = [
  {
    id: "p1",
    board: "share",
    title: "AI 블로그 초안에서 내가 말하지 않은 경험을 찾는 방법",
    author: "글웨이",
    at: "2026-09-17",
    body: "생성 초안과 실제 경험 불일치 검출. 브랜드 블로그 검수에 사용.",
    url: "https://www.i-boss.co.kr/ab-1",
  },
  {
    id: "p2",
    board: "share",
    title: "네이버 플레이스 결핍 진단 + 3개 채널 피칭 문구",
    author: "b2b",
    at: "2026-09-16",
    body: "플레이스 결핍 항목과 채널별 피칭. 기존 플레이스 지식보다 최신.",
    url: "https://www.i-boss.co.kr/ab-2",
  },
  {
    id: "p3",
    board: "viral",
    title: "인스타 바이럴 콘텐츠 뿌리겠습니다",
    author: "스니핏",
    at: "2026-09-16",
    body: "대행 홍보성 배포 제안.",
    url: "https://www.i-boss.co.kr/ab-3",
  },
  {
    id: "p4",
    board: "qna",
    title: "구글 애즈 세팅 관련",
    author: "조조중",
    at: "2026-09-16",
    body: "전환 추적이 안 잡힘. 기존 체크리스트와 겹치나 증상 사례 추가.",
    url: "https://www.i-boss.co.kr/ab-4",
  },
  {
    id: "p5",
    board: "comm",
    title: "오늘치 행운 긁긁",
    author: "발등튀김",
    at: "2026-09-17",
    body: "잡담·복권.",
    url: "https://www.i-boss.co.kr/ab-5",
  },
  {
    id: "p6",
    board: "comm",
    title: "뭐? 텐젤리랑 복권을 하고 싶다고? (리터나눔)",
    author: "나쁜신입은없다",
    at: "2026-09-16",
    body: "리터 나눔.",
    url: "https://www.i-boss.co.kr/ab-6",
  },
  {
    id: "p7",
    board: "hot",
    title: "검색광고 입찰 상한과 순위 밀림 실측",
    author: "실무러",
    at: "2026-09-15",
    body: "네이버 SA 그룹 순위·CPC. 광고비 업무와 직결.",
    url: "https://www.i-boss.co.kr/ab-7",
  },
];

const NOISE = /복권|리터|나눔|긁긁|ㅋㅋ|행운/;
const SIGNAL = /애즈|광고|플레이스|바이럴|입찰|블로그|전환|PMAX|검색광고|GA|애널리틱스/;

function tokens(s: string) {
  return new Set(s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").split(" ").filter((w) => w.length > 1));
}

export function overlap(a: string, b: string) {
  const A = tokens(a);
  const B = tokens(b);
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return n / Math.max(1, Math.min(A.size, B.size));
}

export function freshDays(at: string, today = "2026-09-17") {
  const d = (Date.parse(today) - Date.parse(at)) / 86400000;
  return Math.max(0, Math.round(d));
}

export function cheapFilter(p: Post): Hit | null {
  if (NOISE.test(p.title) || NOISE.test(p.body)) {
    return { post: p, verdict: "skip", why: "잡담·나눔", score: 0, fresh: freshDays(p.at), gpu: "qwen3-8b" };
  }
  return null;
}

export function judge(p: Post, stored = STORED): Hit {
  const cheap = cheapFilter(p);
  if (cheap) return cheap;
  const near = stored
    .map((s) => ({ s, o: Math.max(overlap(p.title, s.title), overlap(p.title + p.body, s.title + s.body)) }))
    .sort((a, b) => b.o - a.o)[0];
  const days = freshDays(p.at);
  const trend = BOARDS.find((b) => b.id === p.board)?.trend ? 12 : 0;
  const sig = SIGNAL.test(p.title + p.body) ? 40 : 10;
  const recency = Math.max(0, 30 - days * 4);
  let score = sig + recency + trend;
  let verdict: Verdict = score >= 45 ? "keep" : "skip";
  let why = sig >= 40 ? "업무 신호" : "약함";
  let gpu = "qwen3-30b-a3b";
  if (near && near.o >= 0.4) {
    if (p.at > near.s.at && SIGNAL.test(p.body)) {
      verdict = "update";
      why = `기존 ${near.s.id} 갱신`;
      score += 8;
    } else {
      verdict = "skip";
      why = `중복 ${near.s.id}`;
      score = 12;
      gpu = "bge-m3";
    }
  }
  if (p.board === "viral" && /뿌리겠|대행/.test(p.title + p.body)) {
    return { post: p, verdict: "skip", why: "홍보성", score: 8, fresh: days, gpu: "qwen3-8b" };
  }
  return { post: p, verdict, why, score, fresh: days, near: near?.s.id, gpu };
}

export function harvestAll(posts = FEED, stored = STORED) {
  return posts.map((p) => judge(p, stored));
}
