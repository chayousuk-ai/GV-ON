import { GpuChip } from "@/components/operator/gpu-board";
import { HOSTS, type HostId } from "@/lib/platform";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";

export function HostBar() {
  const { hostId, setHost } = useEngine();
  const host = HOSTS[hostId];
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex rounded-lg border border-line bg-elev p-1">
        {(Object.keys(HOSTS) as HostId[]).map((id) => (
          <button
            key={id}
            type="button"
            data-host={id}
            onClick={() => setHost(id)}
            className={cn(
              "h-9 min-w-24 rounded-md px-3 text-sm",
              hostId === id ? "bg-ink text-paper" : "text-ink-2",
            )}
          >
            {HOSTS[id].label}
          </button>
        ))}
      </div>
      <GpuChip />
      <p className="max-w-xs text-right font-mono text-[10px] leading-relaxed text-mute">
        {host.installer} · {host.input}
      </p>
    </div>
  );
}
