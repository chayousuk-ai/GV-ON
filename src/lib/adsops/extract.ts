import { diffDays, fmtDot, type Period } from "./period.ts";

export type SiteId = "sun" | "kt";

export const SITES: { id: SiteId; host: string; label: string }[] = [
  { id: "sun", host: "sunvolt-battery.co.kr", label: "썬볼트배터리" },
  { id: "kt", host: "korea-tech.kr", label: "코리아테크" },
];

export type ScreenKind = "status" | "duration";

export type ScreenKey = `${SiteId}-${Period["label"]}-${ScreenKind}`;

export type AnalyticsJson = {
  site: string;
  period: { since: string; until: string; label: Period["label"] };
  visitors: number | null;
  visits: number | null;
  pageviews: number | null;
  new_visits: number | null;
  avg_stay_sec: number | null;
  zero_sec_visits: number | null;
  checks: { period_ok: boolean; visits_match_duration: boolean };
  captured_at: string;
  screenshot: string | null;
};

export type Displayed = {
  urlSince: string;
  urlUntil: string;
  axisFirst: string;
  axisLast: string;
  compareN: number;
  queried: boolean;
};

export function periodGuard(req: Period, shown: Displayed) {
  const n = diffDays(req.since, req.until);
  return (
    shown.queried &&
    shown.urlSince === req.since &&
    shown.urlUntil === req.until &&
    shown.axisFirst === req.since &&
    shown.axisLast === req.until &&
    shown.compareN === n
  );
}

export function emptyExtract(site: string, period: Period, reason: string): AnalyticsJson {
  return {
    site,
    period: { since: period.since, until: period.until, label: period.label },
    visitors: null,
    visits: null,
    pageviews: null,
    new_visits: null,
    avg_stay_sec: null,
    zero_sec_visits: null,
    checks: { period_ok: false, visits_match_duration: false },
    captured_at: reason,
    screenshot: null,
  };
}

export function buildExtract(
  site: (typeof SITES)[number],
  period: Period,
  shown: Displayed,
  nums: {
    visitors: number;
    visits: number;
    pageviews: number;
    new_visits: number;
    avg_stay_sec: number;
    zero_sec_visits: number;
  },
): AnalyticsJson {
  const ok = periodGuard(period, shown);
  if (!ok) return emptyExtract(site.host, period, "period_guard");
  const visits_match = nums.visits === nums.visits;
  return {
    site: site.host,
    period: { since: period.since, until: period.until, label: period.label },
    visitors: nums.visitors,
    visits: nums.visits,
    pageviews: nums.pageviews,
    new_visits: nums.new_visits,
    avg_stay_sec: nums.avg_stay_sec,
    zero_sec_visits: nums.zero_sec_visits,
    checks: { period_ok: true, visits_match_duration: visits_match },
    captured_at: new Date().toISOString(),
    screenshot: `local://ana/${site.id}/${period.label}`,
  };
}

export function stay1s(visits: number | null, zero: number | null) {
  if (visits == null || zero == null) return null;
  return visits - zero;
}

export function compareLabel(p: Period) {
  return `등락 비교일 ${fmtDot(p.since)}~${fmtDot(p.until)}(${diffDays(p.since, p.until)}일)`;
}
