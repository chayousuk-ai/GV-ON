export type SurfaceId =
  | "naver"
  | "google"
  | "kakao"
  | "youtube"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "community"
  | "gads"
  | "nads"
  | "kmoment"
  | "metaads"
  | "ga4"
  | "nstat"
  | "ali1688";
export type Level = "L1" | "L2" | "L3" | "L4";
export type WriteKind = "login" | "logout" | "post" | "comment" | "pause" | "budget";
export type PageId = "search" | "article" | "compose" | "login" | "feed" | "watch" | "ads" | "analytics" | "shop";

export type SomMark = {
  id: number;
  gvId: string;
  role: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LogKind = "observe" | "act" | "vl" | "memory" | "gate" | "save";

export type LogLine = {
  t: number;
  kind: LogKind;
  level?: Level;
  text: string;
};

export type SavedDoc = {
  id: string;
  portal: SurfaceId;
  title: string;
  extract: string;
  url: string;
  at: number;
};

export type TaskDef = {
  id: string;
  title: string;
  blurb: string;
  portal: SurfaceId;
  write?: WriteKind;
  keyword?: string;
  deviceId?: string;
  page?: PageId;
};

export type Session = {
  loggedIn: boolean;
  user: string;
};

export type Article = {
  id: string;
  title: string;
  source: string;
  body: string;
};

export type PortalState = {
  page: PageId;
  query: string;
  results: Article[];
  open?: Article;
  draftTitle: string;
  draftBody: string;
  comments: string[];
  published: { title: string; body: string }[];
  campaigns: { id: string; name: string; status: "ENABLED" | "PAUSED"; spend: number; clicks: number; impr: number }[];
};
