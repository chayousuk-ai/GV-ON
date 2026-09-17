/** 부록 B-3. 임의 변경 금지. */

export type PeriodKind = "일간" | "주간" | "월간";

export type Period = {
  since: string;
  until: string;
  label: PeriodKind;
  days: number;
};

export function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(s: string, n: number) {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}

export function lastBusinessDay(from: Date) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return iso(d);
}

export function monthAnchor(base: string) {
  if (base >= "2026-09-01") return "2026-08-28";
  if (base >= "2026-08-01") return "2026-07-31";
  return "2026-08-28";
}

export function weekRange(base: string): Period {
  const start = monthAnchor(base);
  let cur = start;
  while (addDays(cur, 7) <= base) cur = addDays(cur, 7);
  return { since: cur, until: base, label: "주간", days: diffDays(cur, base) };
}

export function monthRange(base: string): Period {
  const since = monthAnchor(base);
  return { since, until: base, label: "월간", days: diffDays(since, base) };
}

export function dayRange(base: string): Period {
  return { since: base, until: base, label: "일간", days: 1 };
}

export function diffDays(since: string, until: string) {
  return Math.round((parseIso(until).getTime() - parseIso(since).getTime()) / 86400000) + 1;
}

export function allPeriods(base: string): Period[] {
  return [dayRange(base), weekRange(base), monthRange(base)];
}

export function fmtDot(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${y}.${m}.${d}`;
}
