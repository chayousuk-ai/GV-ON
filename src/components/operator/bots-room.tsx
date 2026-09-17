import { useEffect, useRef, useState } from "react";
import { Paperclip, Plus } from "lucide-react";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";

export function BotsRoom() {
  const {
    bots,
    botId,
    chats,
    files,
    jobs,
    plan,
    selectBot,
    createBot,
    sendChat,
    attachFile,
    confirmPlan,
    pauseJob,
    tickJobs,
  } = useEngine();
  const [draft, setDraft] = useState("");
  const [newName, setNewName] = useState("");
  const [newJob, setNewJob] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const bot = bots.find((b) => b.id === botId);
  const thread = chats[botId] ?? [];
  const mine = jobs.filter((j) => j.botId === botId);

  useEffect(() => {
    const id = window.setInterval(() => tickJobs(), 900);
    return () => window.clearInterval(id);
  }, [tickJobs]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [thread.length]);

  return (
    <div className="grid min-h-[32rem] gap-3 rounded-xl border border-line bg-paper lg:grid-cols-[11rem_minmax(0,1fr)_14rem]">
      <aside className="border-b border-line p-3 lg:border-b-0 lg:border-r">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">봇</p>
        <ul className="mt-2 space-y-1">
          {bots.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                data-bot={b.id}
                onClick={() => selectBot(b.id)}
                className={cn(
                  "w-full rounded-lg border px-2 py-2 text-left",
                  b.id === botId ? "border-ink bg-paper-2" : "border-transparent hover:bg-paper-2",
                )}
              >
                <span className="block text-sm font-medium">{b.name}</span>
                <span className="block text-[11px] text-mute">{b.job}</span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            createBot(newName, newJob);
            setNewName("");
            setNewJob("");
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="이름"
            className="h-10 w-full rounded-md border border-line px-2 text-sm"
          />
          <input
            value={newJob}
            onChange={(e) => setNewJob(e.target.value)}
            placeholder="역할"
            className="h-10 w-full rounded-md border border-line px-2 text-sm"
          />
          <button type="submit" className="flex h-10 w-full items-center justify-center gap-1 rounded-md border border-line text-sm">
            <Plus className="size-3.5" /> 봇 추가
          </button>
        </form>
      </aside>

      <section className="flex min-h-0 flex-col p-3">
        <p className="text-sm font-medium">{bot?.name} · Hermes</p>
        <p className="text-xs text-mute">로컬 LLM 자리. 지금은 규칙 하네스가 방법·일정을 정합니다.</p>
        <div ref={scroller} className="mt-3 min-h-48 flex-1 space-y-2 overflow-auto">
          {thread.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[42rem] rounded-lg px-3 py-2 text-sm leading-relaxed",
                m.role === "user" ? "ml-auto bg-ink text-paper" : "bg-paper-2",
              )}
            >
              <p className="text-[10px] uppercase tracking-wide opacity-70">{m.role}</p>
              <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
            </div>
          ))}
        </div>
        {(files[botId] ?? []).length > 0 && (
          <p className="mt-2 text-[11px] text-mute">첨부: {(files[botId] ?? []).map((f) => f.name).join(", ")}</p>
        )}
        {plan && (
          <div className="mt-2 rounded-lg border border-line bg-elev p-3">
            <p className="text-xs font-medium">Hermes 플랜 · 확정 전</p>
            <p className="mt-1 text-xs text-mute">{plan.cadence.label} · {plan.skillHint}</p>
            <button type="button" data-confirm-plan onClick={() => confirmPlan()} className="mt-2 h-10 rounded-md bg-ink px-4 text-sm text-paper">
              스케줄 확정
            </button>
          </div>
        )}
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendChat(draft);
            setDraft("");
          }}
        >
          <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-line">
            <Paperclip className="size-4" />
            <input
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  attachFile({
                    id: crypto.randomUUID(),
                    name: f.name,
                    bytes: f.size,
                    excerpt: String(reader.result).slice(0, 400),
                  });
                };
                reader.readAsText(f);
                e.target.value = "";
              }}
            />
          </label>
          <input
            data-bot-chat
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="예: 평일 아침 네이버에서 AX 키워드 저장"
            className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm"
          />
          <button type="submit" className="h-11 rounded-md bg-ink px-4 text-sm text-paper">
            보내기
          </button>
        </form>
      </section>

      <aside className="border-t border-line p-3 lg:border-l lg:border-t-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">작업</p>
        <ul className="mt-2 space-y-2">
          {mine.length === 0 && <li className="text-xs text-mute">확정된 job이 없습니다.</li>}
          {mine.map((j) => (
            <li key={j.id} className="rounded-lg border border-line p-2">
              <p className="text-xs font-medium">{j.title}</p>
              <p className="font-mono text-[10px] text-mute">
                {j.cadence.kind} · {j.status}
              </p>
              {j.lastLog && <p className="mt-1 text-[11px] text-ink-2">{j.lastLog}</p>}
              <button type="button" onClick={() => pauseJob(j.id)} className="mt-2 h-8 rounded-md border border-line px-2 text-[11px]">
                {j.status === "paused" ? "재개" : "일시정지"}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
