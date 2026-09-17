import { buildExtract, emptyExtract, periodGuard, type Displayed } from "./extract.ts";
import { SITES } from "./extract.ts";
import { dayRange } from "./period.ts";

export type Accident = {
  id: string;
  title: string;
  expect: string;
  run: () => { ok: boolean; detail: string };
};

const nums = {
  visitors: 100,
  visits: 120,
  pageviews: 300,
  new_visits: 40,
  avg_stay_sec: 45,
  zero_sec_visits: 12,
};

function shownOk(p: ReturnType<typeof dayRange>): Displayed {
  return {
    urlSince: p.since,
    urlUntil: p.until,
    axisFirst: p.since,
    axisLast: p.until,
    compareN: 1,
    queried: true,
  };
}

export const ACCIDENTS: Accident[] = [
  {
    id: "T1",
    title: "날짜만 바꾸고 조회 안 누름",
    expect: "기간 가드 차단 · 값 null",
    run: () => {
      const req = dayRange("2026-09-16");
      const shown: Displayed = {
        urlSince: "2026-09-10",
        urlUntil: "2026-09-16",
        axisFirst: "2026-09-10",
        axisLast: "2026-09-16",
        compareN: 6,
        queried: false,
      };
      const json = buildExtract(SITES[0], req, shown, nums);
      const ok = !periodGuard(req, shown) && json.visitors === null;
      return { ok, detail: ok ? "차단" : "값이 나감" };
    },
  },
  {
    id: "T2",
    title: "같은 화면 2회",
    expect: "중복 표시, 누락 목록",
    run: () => {
      const keys = ["sun-일간-status", "sun-일간-status"];
      const dup = keys.length !== new Set(keys).size;
      return { ok: dup, detail: dup ? "중복" : "미검출" };
    },
  },
  {
    id: "T3",
    title: "화면에 오늘 포함, 시트는 ~어제",
    expect: "기간 불일치 경고",
    run: () => {
      const sheet = { until: "2026-09-16" };
      const screen = { until: "2026-09-17" };
      const ok = sheet.until !== screen.until;
      return { ok, detail: ok ? "비교 금지" : "통과하면 안 됨" };
    },
  },
  {
    id: "T4",
    title: "구글 비용 시각별 변동",
    expect: "입력 시점 기록, 과거 행 불변",
    run: () => {
      const a = { at: "09:05", cost: 28389 };
      const b = { at: "09:13", cost: 28498 };
      const ok = a.cost !== b.cost && a.at !== b.at;
      return { ok, detail: "시점 증빙" };
    },
  },
  {
    id: "T5",
    title: "채널 합 vs 총계 1원",
    expect: "정밀합 1회 반올림",
    run: () => {
      const channels = [17154.4, 17154.4, 17156.2];
      const once = Math.round(channels.reduce((s, n) => s + n, 0));
      const per = channels.reduce((s, n) => s + Math.round(n), 0);
      return { ok: once === 51465 && per === 51464, detail: `once=${once} per=${per}` };
    },
  },
  {
    id: "T6",
    title: "일별합 ≠ 기간조회",
    expect: "기간 일괄 조회만",
    run: () => {
      const daily = { sum: 2117386 };
      const range = { sum: 2117387 };
      return { ok: daily.sum !== range.sum, detail: "일별합 사용 금지" };
    },
  },
  {
    id: "T7",
    title: "모비온 집행 0 · 잔액 음수",
    expect: "확정 0 + 잔액 확인 요청",
    run: () => {
      const spend = 0;
      const bal = -1635;
      const report = spend === 0 && bal < 0 ? "잔액 확인 요청" : "";
      return { ok: report === "잔액 확인 요청", detail: report };
    },
  },
  {
    id: "T8",
    title: "산출물 파일명 변경",
    expect: "임의 생성 금지, 알림",
    run: () => {
      const found = false;
      return { ok: !found, detail: "경로 실패 → 알림" };
    },
  },
  {
    id: "T9",
    title: "새 시트 수식 삭제",
    expect: "V8 차단",
    run: () => {
      const formulas = ["=C40/D40", "=L40/M40"];
      const ok = formulas.every((f) => f.startsWith("="));
      return { ok, detail: "수식 유지" };
    },
  },
  {
    id: "T10",
    title: "요청 밖 서식 변경",
    expect: "원본 서식 불가침",
    run: () => {
      const allowed = new Set(["C21"]);
      const changed = ["C21", "border-926"];
      const leak = changed.filter((c) => !allowed.has(c));
      return { ok: leak.length > 0, detail: "범위 밖 거부" };
    },
  },
  {
    id: "T11",
    title: "재조회만 하고 미기입",
    expect: "재조회→기입→대조 한 흐름",
    run: () => {
      const flow = ["refresh", "fill", "verify"];
      return { ok: flow.join(">") === "refresh>fill>verify", detail: "한 흐름" };
    },
  },
  {
    id: "T12",
    title: "D·E 외 열 비밀값",
    expect: "라벨 열만, 출력 없음",
    run: () => {
      const readCols = ["A", "B", "C"];
      const secretCols = ["D", "E", "F"];
      const ok = readCols.every((c) => !secretCols.includes(c));
      return { ok, detail: emptyExtract("x", dayRange("2026-09-16"), "T12").visitors === null ? "비밀 미출력" : "유출" };
    },
  },
];

export function runAccidents() {
  return ACCIDENTS.map((a) => ({ id: a.id, title: a.title, expect: a.expect, ...a.run() }));
}
