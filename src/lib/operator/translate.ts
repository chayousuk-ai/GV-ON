export const DICT: Record<string, string> = {
  纯棉短袖: "면 반팔",
  "纯棉短袖 T恤": "면 반팔 티셔츠",
  厂家直销: "공장 직송",
  "尺码：M-4XL": "사이즈: M–4XL",
  一件代发: "한 장부터 발송",
  批发价: "도매가",
  现货: "재고 있음",
  包邮: "배송비 포함",
  详情: "상세",
  规格: "규격",
  颜色: "색상",
  白色: "흰색",
  黑色: "검정",
  搜索: "검색",
  找货源: "소싱",
  "1688型 批发": "1688형 도매",
  材质纯棉: "소재 면 100%",
  起订量1件: "최소 주문 1장",
};

export type ImageLayer = {
  id: string;
  t: string;
  l: string;
  zh: string;
  ko: string;
};

export const LAYERS: ImageLayer[] = [
  { id: "l1", t: "10%", l: "8%", zh: "纯棉短袖 T恤", ko: "면 반팔 티셔츠" },
  { id: "l2", t: "34%", l: "8%", zh: "厂家直销", ko: "공장 직송" },
  { id: "l3", t: "56%", l: "8%", zh: "尺码：M-4XL", ko: "사이즈: M–4XL" },
  { id: "l4", t: "74%", l: "8%", zh: "一件代发", ko: "한 장부터 발송" },
];

export function tx(src: string, on: boolean) {
  if (!on) return src;
  return DICT[src] ?? src;
}

export const PLUGINS = [
  { id: "tr-text", label: "번역(텍스트)", blurb: "GPU1 HY-MT1.5-1.8B. 로컬만." },
  { id: "tr-image", label: "번역(이미지)", blurb: "GPU1 OCR 박스 위 한국어. 이미지 재생성 없음." },
] as const;
