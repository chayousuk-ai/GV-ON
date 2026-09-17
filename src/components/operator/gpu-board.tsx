import { GPU0, GPU1_POOL, GPU1_VRAM, usedMb } from "@/lib/adsops/gpus";
import { useGpu } from "@/lib/adsops/gpu-store";
import { LAYERS } from "@/lib/operator/translate";
import { cn } from "@/lib/utils";

export function GpuBoard() {
  const { loaded, last, err, load, unload, run } = useGpu();
  const used = usedMb(loaded);
  const pct = Math.min(100, Math.round((used / GPU1_VRAM) * 100));

  return (
    <section className="rounded-xl border border-line bg-elev p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-mute">GPU · 로컬만 · 외부 전송 없음</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-paper p-2">
          <p className="text-xs font-medium">GPU0 · 설치됨 · 추가 없음</p>
          <ul className="mt-1 space-y-0.5 font-mono text-[10px] text-mute">
            {GPU0.map((s) => (
              <li key={s.id}>
                {s.name} · {s.role}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-paper p-2">
          <p className="text-xs font-medium">
            GPU1 · 32GB · {used}MB ({pct}%)
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-paper-2">
            <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-2 space-y-1">
            {GPU1_POOL.map((s) => {
              const on = loaded.includes(s.id);
              return (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px]">
                    {s.name} · {s.vramMb}MB{s.optional ? " · 옵션" : ""}
                  </span>
                  <button
                    type="button"
                    data-gpu-slot={s.id}
                    onClick={() => (on ? unload(s.id) : load(s.id))}
                    className={cn("h-7 rounded-md px-2 text-[11px]", on ? "bg-ink text-paper" : "border border-line")}
                  >
                    {on ? "내림" : "올림"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-tr-text
          onClick={() => run("translate-text", "纯棉短袖")}
          className="h-9 rounded-md bg-ink px-3 text-sm text-paper"
        >
          번역(텍스트) GPU1
        </button>
        <button
          type="button"
          data-tr-image
          onClick={() => {
            run("ocr-box", "1688 배너");
            run("translate-image", "厂家直销");
          }}
          className="h-9 rounded-md border border-line px-3 text-sm"
        >
          번역(이미지) 레이어
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-warn">{err}</p>}
      {last && (
        <p className="mt-2 font-mono text-[11px]">
          GPU{last.gpu} · {last.model} · {last.in} → {last.out}
        </p>
      )}
      {last?.job === "translate-image" && (
        <div className="relative mt-2 h-28 overflow-hidden rounded-md bg-paper-2">
          {LAYERS.map((l) => (
            <span
              key={l.id}
              className="absolute rounded bg-paper/90 px-1.5 py-0.5 text-[11px]"
              style={{ top: l.t, left: l.l }}
            >
              {l.ko}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export function GpuChip() {
  const loaded = useGpu((s) => s.loaded);
  const used = usedMb(loaded);
  return (
    <p className="font-mono text-[10px] text-mute">
      GPU0 점유 · GPU1 {used}/{GPU1_VRAM}MB
    </p>
  );
}
