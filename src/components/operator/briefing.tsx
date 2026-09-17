import { GpuBoard } from "@/components/operator/gpu-board";
import { SITES, stay1s } from "@/lib/adsops/extract";
import { allPeriods, fmtDot } from "@/lib/adsops/period";
import { PROFILES } from "@/lib/adsops/profiles";
import { briefingSlots, profileOf, slotKey, useAdsOps } from "@/lib/adsops/store";
import { cn } from "@/lib/utils";

export function BriefingRoom() {
  const {
    scanning,
    profileId,
    base,
    confirmed,
    slot,
    queried,
    dirtyDates,
    extracts,
    tests,
    setProfile,
    confirmPeriod,
    pickSlot,
    query,
    t1,
    extract,
    stopScan,
    runTests,
  } = useAdsOps();
  const periods = allPeriods(base);
  const slots = briefingSlots(base);
  const profile = profileOf(profileId);
  const period = periods.find((p) => p.label === slot.period)!;
  const site = SITES.find((s) => s.id === slot.site)!;
  const json = extracts[slotKey(slot)];
  const done = Object.keys(extracts).length;

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      {scanning && (
        <button
          type="button"
          data-scan-banner
          onClick={stopScan}
          className="h-10 rounded-lg bg-warn px-3 text-sm font-medium text-paper"
        >
          화면 스캔 중 · 누르면 즉시 중단
        </button>
      )}

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">프로필 · 금고 항목명만</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              data-profile={p.id}
              onClick={() => setProfile(p.id)}
              className={cn(
                "h-9 rounded-md border px-2.5 text-left text-[11px]",
                p.id === profileId ? "border-ink bg-ink text-paper" : "border-line",
              )}
            >
              {p.media}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-mute">
          {profile.vault} · {profile.login} · {profile.role} · 비밀값 없음
        </p>
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">기간 · B-3</p>
        <p className="mt-1 text-sm">
          기준일 {fmtDot(base)} · 일 {fmtDot(periods[0].since)} · 주 {fmtDot(periods[1].since)}~{fmtDot(periods[1].until)} · 월{" "}
          {fmtDot(periods[2].since)}~{fmtDot(periods[2].until)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" data-confirm-period onClick={confirmPeriod} className="h-10 rounded-md bg-ink px-3 text-sm text-paper">
            기간 확인
          </button>
          <button type="button" data-t1 onClick={t1} className="h-10 rounded-md border border-line px-3 text-sm">
            T1 재현 (조회 안 누름)
          </button>
        </div>
        {!confirmed && <p className="mt-2 text-xs text-mute">공휴일·회계 변경 대비. 확인 후에만 추출.</p>}
      </section>

      <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-xl border border-line bg-paper p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-mute">
            {site.label} · {slot.period} · {slot.kind === "status" ? "사이트현황" : "체류시간"}
          </p>
          <p className="mt-1 font-mono text-[10px] text-mute">
            startDateStr={fmtDot(dirtyDates ? "2026-09-10" : period.since)} endDateStr={fmtDot(period.until)} queried={String(queried)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Stat k="방문자" v={queried && !dirtyDates ? "80" : "—"} />
            <Stat k="방문횟수" v={queried && !dirtyDates ? "100" : "—"} />
            <Stat k="페이지뷰" v={queried && !dirtyDates ? "240" : "—"} />
            <Stat k="0초" v={queried && !dirtyDates ? "10" : "—"} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" data-query disabled={!confirmed} onClick={query} className="h-10 rounded-md bg-ink px-3 text-sm text-paper disabled:opacity-40">
              조회
            </button>
            <button type="button" data-extract disabled={!confirmed} onClick={extract} className="h-10 rounded-md border border-line px-3 text-sm disabled:opacity-40">
              값 읽기
            </button>
          </div>
          {json && (
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-paper-2 p-2 font-mono text-[10px] leading-relaxed">
              {JSON.stringify(
                { ...json, stay_1s: stay1s(json.visits, json.zero_sec_visits) },
                null,
                2,
              )}
            </pre>
          )}
        </section>

        <section className="rounded-xl border border-line bg-elev p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-mute">12화면 {done}/12</p>
          <ul className="mt-2 max-h-72 space-y-1 overflow-auto">
            {slots.map((s) => {
              const k = slotKey(s);
              const hit = extracts[k];
              return (
                <li key={k}>
                  <button
                    type="button"
                    data-slot={k}
                    onClick={() => pickSlot(s)}
                    className={cn(
                      "w-full rounded-md px-2 py-1 text-left text-[11px]",
                      slotKey(slot) === k ? "bg-ink text-paper" : "hover:bg-paper",
                    )}
                  >
                    {s.site} {s.period} {s.kind === "status" ? "현황" : "체류"}
                    {hit ? (hit.checks.period_ok ? " · ok" : " · 차단") : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <GpuBoard />

      <section className="rounded-xl border border-line bg-elev p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-mute">T1–T12</p>
          <button type="button" data-run-tests onClick={runTests} className="h-9 rounded-md border border-line px-3 text-xs">
            테스트 실행
          </button>
        </div>
        <ol className="mt-2 grid gap-1 sm:grid-cols-2">
          {(tests.length ? tests : []).map((t) => (
            <li key={t.id} className="font-mono text-[11px]">
              {t.id} {t.ok ? "통과" : "실패"} · {t.detail}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-line px-2 py-1.5">
      <p className="text-[10px] text-mute">{k}</p>
      <p className="text-sm">{v}</p>
    </div>
  );
}
