import { useState } from "react";
import { PACKS, savePack } from "@/lib/packs";
import { cn } from "@/lib/utils";

export function PackButtons() {
  const [msg, setMsg] = useState("");
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {PACKS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            data-pack={p.id}
            onClick={() => {
              setMsg("받는 중…");
              void savePack(p.href, p.name)
                .then(() => setMsg(`${p.name} 저장 창을 열었습니다.`))
                .catch((e: unknown) => setMsg(e instanceof Error ? e.message : "받기 실패"));
            }}
            className={cn(
              "inline-flex h-10 items-center rounded-md px-3 text-sm",
              i === 0 ? "bg-ink text-paper" : "border border-line bg-elev",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {msg ? <p className="max-w-xs text-right text-[11px] text-mute">{msg}</p> : null}
    </div>
  );
}
