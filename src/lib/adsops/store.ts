import { create } from "zustand";
import { ACCIDENTS } from "./accidents";
import {
  buildExtract,
  emptyExtract,
  SITES,
  stay1s,
  type AnalyticsJson,
  type Displayed,
  type ScreenKind,
  type SiteId,
} from "./extract";
import { lastBusinessDay, type Period, type PeriodKind, allPeriods } from "./period";
import { PROFILES, type Profile } from "./profiles";

export type Slot = {
  site: SiteId;
  period: PeriodKind;
  kind: ScreenKind;
};

function keyOf(s: Slot) {
  return `${s.site}-${s.period}-${s.kind}`;
}

const KINDS: ScreenKind[] = ["status", "duration"];

function slotsFor(periods: Period[]): Slot[] {
  const out: Slot[] = [];
  for (const site of SITES) {
    for (const p of periods) {
      for (const kind of KINDS) out.push({ site: site.id, period: p.label, kind });
    }
  }
  return out;
}

type AdsOps = {
  scanning: boolean;
  profileId: string;
  base: string;
  confirmed: boolean;
  slot: Slot;
  queried: boolean;
  dirtyDates: boolean;
  extracts: Record<string, AnalyticsJson>;
  tests: { id: string; ok: boolean; detail: string }[];
  setProfile: (id: string) => void;
  confirmPeriod: () => void;
  pickSlot: (s: Slot) => void;
  query: () => void;
  t1: () => void;
  extract: () => void;
  stopScan: () => void;
  runTests: () => void;
};

function demoNums(slot: Slot) {
  const seed = slot.site === "sun" ? 1 : 2;
  const visits = 80 + seed * 20;
  return {
    visitors: 70 + seed * 10,
    visits,
    pageviews: 200 + seed * 40,
    new_visits: 20 + seed * 5,
    avg_stay_sec: 40 + seed,
    zero_sec_visits: 8 + seed,
  };
}

export const useAdsOps = create<AdsOps>()((set, get) => {
  const base = lastBusinessDay(new Date(2026, 8, 17));
  const periods = allPeriods(base);
  const first: Slot = { site: "sun", period: "일간", kind: "status" };
  return {
    scanning: false,
    profileId: "naver-ana",
    base,
    confirmed: false,
    slot: first,
    queried: false,
    dirtyDates: false,
    extracts: {},
    tests: [],
    setProfile: (id) => set({ profileId: id }),
    confirmPeriod: () => set({ confirmed: true, queried: false, dirtyDates: false }),
    pickSlot: (s) => set({ slot: s, queried: false, dirtyDates: false, scanning: false }),
    query: () => set({ queried: true, dirtyDates: false, scanning: true }),
    t1: () => set({ dirtyDates: true, queried: false, scanning: false }),
    stopScan: () => set({ scanning: false }),
    extract: () => {
      const s = get();
      const period = allPeriods(s.base).find((p) => p.label === s.slot.period)!;
      const site = SITES.find((x) => x.id === s.slot.site)!;
      const shown: Displayed = s.dirtyDates
        ? {
            urlSince: period.since,
            urlUntil: period.until,
            axisFirst: "2026-09-10",
            axisLast: period.until,
            compareN: 6,
            queried: false,
          }
        : {
            urlSince: period.since,
            urlUntil: period.until,
            axisFirst: period.since,
            axisLast: period.until,
            compareN: period.days,
            queried: s.queried,
          };
      const json = s.queried && !s.dirtyDates
        ? buildExtract(site, period, shown, demoNums(s.slot))
        : emptyExtract(site.host, period, "period_guard");
      set((st) => ({
        scanning: false,
        extracts: { ...st.extracts, [keyOf(st.slot)]: json },
      }));
    },
    runTests: () =>
      set({
        tests: ACCIDENTS.map((a) => {
          const r = a.run();
          return { id: a.id, ok: r.ok, detail: r.detail };
        }),
      }),
  };
});

export function slotKey(s: Slot) {
  return keyOf(s);
}

export function briefingSlots(base: string) {
  return slotsFor(allPeriods(base));
}

export function profileOf(id: string): Profile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[1];
}

export { stay1s };
