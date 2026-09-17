import { BriefingRoom } from "@/components/operator/briefing";
import { BRANDS, CHAIN, RITUALS, brandName, ritualProgress } from "@/lib/adsops/purpose";
import { usePurpose } from "@/lib/adsops/purpose-store";
import { useAdsOps } from "@/lib/adsops/store";
import { useFleet } from "@/lib/adsops/fleet-store";
import { cn } from "@/lib/utils";

export function TodayRoom() {
  const pane = usePurpose((s) => s.pane);
  const setPane = usePurpose((s) => s.setPane);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex rounded-lg border border-line bg-elev p-1">
        {(["desk", "screens", "inbox", "handoff"] as const).map((id) => (
          <button
            key={id}
            type="button"
            data-desk={id}
            onClick={() => setPane(id)}
            className={cn("h-9 flex-1 rounded-md text-[12px]", pane === id ? "bg-ink text-paper" : "text-ink-2")}
          >
            {id === "desk" ? "일과" : id === "screens" ? "12화면" : id === "inbox" ? "승인" : "인수인계"}
          </button>
        ))}
      </div>
      {pane === "screens" ? <BriefingRoom /> : pane === "inbox" ? <InboxPane /> : pane === "handoff" ? <HandoffPane /> : <DeskPane />}
    </div>
  );
}

function DeskPane() {
  const { ritual, brand, setRitual, setBrand, suggest, suggestGoal, applyGoal, draftFromKnow, draft, alerts, logs } = usePurpose();
  const extracts = useAdsOps((s) => Object.keys(s.extracts).length);
  const wait = usePurpose((s) => s.approvals.filter((a) => a.status === "wait").length);
  const saved = usePurpose((s) => s.savedHandoff);
  const prog = ritualProgress(ritual, { extracts, approvalsWait: wait, handoff: saved });

  return (
    <>
      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">일과 · 숫자는 읽고 돈은 승인</p>
        <div className="mt-2 flex gap-1">
          {RITUALS.map((r) => (
            <button
              key={r.id}
              type="button"
              data-ritual={r.id}
              onClick={() => setRitual(r.id)}
              className={cn("h-9 flex-1 rounded-md text-sm", ritual === r.id ? "bg-ink text-paper" : "border border-line")}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm">
          {RITUALS.find((r) => r.id === ritual)?.items.join(" · ")}
          <span className="mt-1 block font-mono text-[11px] text-mute">
            {prog.done ? "이 구간 완료" : `진행 ${prog.have}/${ritual === "morning" ? 12 : ritual === "noon" ? `대기 ${wait}` : 1}`}
          </span>
        </p>
      </section>

      <section className="rounded-xl border border-line bg-paper p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">브랜드 · 섞지 않음</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              data-brand={b.id}
              onClick={() => setBrand(b.id)}
              className={cn("h-9 rounded-md px-2.5 text-[12px]", brand === b.id ? "bg-ink text-paper" : "border border-line")}
            >
              {b.name}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">판단 사슬 · 노출 → 클릭 → 문의 → 매출</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHAIN.map((c) => (
            <li key={c.id} className="rounded-md border border-line px-2 py-2">
              <p className="text-[11px] text-mute">{c.label}</p>
              <p className="text-sm">
                {c.now}
                <span className="text-mute">/{c.goal} {c.unit}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" data-suggest className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={suggestGoal}>
            AI 목표 추천
          </button>
          <button type="button" data-apply-goal className="h-9 rounded-md border border-line px-3 text-sm" onClick={applyGoal} disabled={suggest !== "wait"}>
            사람 확인 후 적용
          </button>
        </div>
        <p className="mt-2 text-xs text-mute">
          {suggest === "idle" ? "추천은 초안. 적용은 승인." : suggest === "wait" ? `${brandName(brand)} 주간 문의 96→120 제안` : "목표 적용됨 · 실행은 관찰"}
        </p>
      </section>

      <section className="rounded-xl border border-line bg-paper p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">비용은 항상 경고 · 지식은 초안만</p>
        <ul className="mt-2 space-y-1 text-sm">
          {alerts.map((a) => (
            <li key={a.id}>{a.level === "warn" ? "경고" : "정상"} · {a.title}</li>
          ))}
        </ul>
        <button type="button" data-draft-know className="mt-2 h-9 rounded-md border border-line px-3 text-sm" onClick={draftFromKnow}>
          지식 → {brandName(brand)} 초안
        </button>
        {draft && <p className="mt-2 text-sm">{draft}</p>}
      </section>

      {logs[0] && <p className="font-mono text-[11px] text-mute">{logs[0].ok ? "됨" : "안 됨"} · {logs[0].t}</p>}
    </>
  );
}

function InboxPane() {
  const { approvals, decide, logs } = usePurpose();
  const seat = useFleet((s) => s.seat);

  return (
    <section className="rounded-xl border border-line bg-elev p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-mute">승인함 · 입찰·ON/OFF·목표는 사람</p>
      <p className="mt-1 text-xs text-mute">{seat === "owner" ? "대표 좌석" : "직원 조회만"}</p>
      <ul className="mt-2 space-y-2">
        {approvals.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-2 py-2">
            <span className="text-sm">
              {brandName(a.brand)} · {a.title}
              <span className="ml-2 font-mono text-[11px] text-mute">{a.status}</span>
            </span>
            {a.status === "wait" && (
              <span className="flex gap-1">
                <button type="button" data-ok={a.id} className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={() => decide(a.id, true)}>
                  승인
                </button>
                <button type="button" data-no={a.id} className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => decide(a.id, false)}>
                  거절
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
      <ul className="mt-3 space-y-1">
        {logs.map((l, i) => (
          <li key={i} className="font-mono text-[11px]">
            {l.ok ? "됨" : "안 됨"} · {l.t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function HandoffPane() {
  const { notes, saveHandoff, savedHandoff, logs } = usePurpose();
  return (
    <section className="rounded-xl border border-line bg-elev p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-mute">인수인계 · 다음 사람이 이어서</p>
      <ul className="mt-2 space-y-1 text-sm">
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" data-handoff-ok className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={() => saveHandoff("12화면 완료 · 카카오 조회 남음 · 비용 +12% 관찰")}>
          마감 저장
        </button>
        <button type="button" data-handoff-secret className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => saveHandoff("비밀번호 전달")}>
          비밀 넣기
        </button>
      </div>
      {savedHandoff && <p className="mt-2 text-sm">인수인계 저장됨. 비밀번호는 없음.</p>}
      <ul className="mt-2 space-y-1">
        {logs.map((l, i) => (
          <li key={i} className="font-mono text-[11px]">
            {l.ok ? "됨" : "안 됨"} · {l.t}
          </li>
        ))}
      </ul>
    </section>
  );
}
