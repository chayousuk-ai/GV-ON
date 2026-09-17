import { STAFF_GPU, STUDIO } from "@/lib/adsops/fleet";
import { useFleet } from "@/lib/adsops/fleet-store";
import { cn } from "@/lib/utils";

export function FleetPanel() {
  const { seat, localOn, studioOn, last, logs, setSeat, setLocal, setStudio, tryJob } = useFleet();

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">배포 · 로컬 우선 · 스튜디오는 나중</p>
        <div className="mt-2 flex gap-1">
          {(["owner", "staff"] as const).map((id) => (
            <button
              key={id}
              type="button"
              data-seat={id}
              onClick={() => setSeat(id)}
              className={cn("h-9 rounded-md px-3 text-sm", seat === id ? "bg-ink text-paper" : "border border-line")}
            >
              {id === "owner" ? "대표 PC" : "직원 Titan XP"}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-mute">
          {seat === "staff" ? `${STAFF_GPU.name} ${STAFF_GPU.vramMb / 1024}GB · 8B·VL·임베딩만` : "GPU0 Qwen · GPU1 32GB 번역·30B"}
        </p>
        <label className="mt-2 flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" data-local checked={localOn} onChange={(e) => setLocal(e.target.checked)} />
          이 PC에 로컬 모델 있음
        </label>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" data-studio checked={studioOn} onChange={(e) => setStudio(e.target.checked)} />
          Tailscale · {STUDIO.host} 연결 (지금은 꺼 둠)
        </label>
      </section>

      <section className="rounded-xl border border-line bg-paper p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">라우팅 시험</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" data-fleet-job="brain" className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={() => tryJob("brain")}>
            두뇌 8B
          </button>
          <button type="button" data-fleet-job="judge" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryJob("harvest-judge")}>
            지식 판단 30B
          </button>
          <button type="button" data-fleet-job="secret" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryJob("brain", "비밀번호 보여줘")}>
            비밀 문장
          </button>
        </div>
        {last && (
          <p className="mt-2 text-sm">
            {last.place} · {last.where}
            <span className="mt-1 block text-xs text-mute">{last.why}</span>
          </p>
        )}
        <ul className="mt-2 space-y-1">
          {logs.map((l, i) => (
            <li key={i} className="font-mono text-[11px]">
              {l.ok ? "보냄" : "안 보냄"} · {l.t}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">{STUDIO.name}</p>
        <p className="mt-1 text-xs text-mute">모델 {STUDIO.models.join(" · ")}</p>
        <p className="mt-1 text-xs text-mute">지식 DB {STUDIO.kb.join(" · ")} · 금고·비밀번호는 PC에만</p>
        <p className="mt-2 text-xs text-mute">직원 설치: GV-ON + (선택) 8B 로컬 + Tailscale. 스튜디오는 이후 한 대만.</p>
      </section>
    </div>
  );
}
