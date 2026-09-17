import { BOARDS, FEED, MENUS, STORED } from "@/lib/adsops/harvest";
import { useHarvest } from "@/lib/adsops/harvest-store";
import { cn } from "@/lib/utils";

export function HarvestRoom() {
  const { board, hits, saved, running, step, vl, pick, run } = useHarvest();
  const list = board ? FEED.filter((p) => p.board === board) : FEED;
  const rows = hits.length ? hits : list.map((p) => ({ post: p, verdict: "" as const, why: "", score: 0, fresh: 0, gpu: "" }));

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">아이보스 · 화면으로만 · DB 접속 없음</p>
        <p className="mt-1 font-mono text-[10px] text-mute">www.i-boss.co.kr · Chrome UA</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {MENUS.map((m) => (
            <span key={m} className="rounded-md border border-line px-2 py-1 text-[11px]">
              {m}
            </span>
          ))}
        </div>
        <button
          type="button"
          data-harvest-run
          disabled={running}
          onClick={() => void run()}
          className="mt-3 h-10 rounded-md bg-ink px-3 text-sm text-paper disabled:opacity-40"
        >
          {running ? "수집 중" : "메뉴 보고 선별 수집"}
        </button>
        <p className="mt-2 text-sm">{step}</p>
        {vl && <p className="font-mono text-[11px] text-mute">VL · {vl}</p>}
      </section>

      <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
        <section className="rounded-xl border border-line bg-paper p-3">
          <div className="flex flex-wrap gap-1">
            {BOARDS.map((b) => (
              <button
                key={b.id}
                type="button"
                data-board={b.id}
                onClick={() => pick(b.id)}
                className={cn("h-8 rounded-md px-2 text-[11px]", board === b.id ? "bg-ink text-paper" : "border border-line")}
              >
                {b.label}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {(hits.length ? hits.filter((h) => !board || h.post.board === board) : rows.filter((h) => !board || h.post.board === board)).map((h) => (
              <li key={h.post.id} className="rounded-md border border-line px-2 py-1.5">
                <p className="text-sm">{h.post.title}</p>
                <p className="font-mono text-[10px] text-mute">
                  {h.post.author} · {h.post.at}
                  {h.verdict ? ` · ${h.verdict} · ${h.why} · ${h.gpu}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-elev p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-mute">Qdrant ko_docs</p>
          <p className="mt-1 text-[11px] text-mute">기존 {STORED.length} · 이번 {saved.length}</p>
          <ul className="mt-2 space-y-1">
            {STORED.map((s) => (
              <li key={s.id} className="font-mono text-[10px] text-mute">
                보유 · {s.title}
              </li>
            ))}
            {saved.map((h) => (
              <li key={h.post.id} className="text-[11px]">
                {h.verdict === "update" ? "갱신" : "신규"} · {h.post.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
