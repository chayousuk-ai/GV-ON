import { Eye, Lock, MousePointer2, Shield } from "lucide-react";
import { PORTALS, TASKS } from "@/lib/operator/data";
import { PACKS, SKILLS } from "@/lib/operator/skills";
import { HOSTS } from "@/lib/platform";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Dock() {
  const {
    task,
    running,
    chooseTask,
    chooseSkill,
    run,
    logs,
    vlText,
    docs,
    pending,
    decide,
    marks,
    portal,
    dock,
    setDock,
    skill,
    hostId,
  } = useEngine();
  const host = PORTALS.find((p) => p.id === portal)?.host;
  const shell = HOSTS[hostId];
  const [pack, setPack] = useState<(typeof PACKS)[number]["id"] | "all">("all");
  const list = pack === "all" ? SKILLS : SKILLS.filter((s) => s.pack === pack);

  return (
    <aside className="flex min-h-0 flex-col gap-3 lg:w-96">
      <div className="flex rounded-lg border border-line bg-elev p-1">
        {(["brief", "web", "skills", "bots", "know", "pc"] as const).map((id) => (
          <button
            key={id}
            type="button"
            data-dock={id}
            onClick={() => setDock(id)}
            className={cn(
              "h-9 flex-1 rounded-md text-[12px]",
              dock === id ? "bg-ink text-paper" : "text-ink-2",
            )}
          >
            {id === "brief" ? "오늘" : id === "web" ? "웹" : id === "skills" ? "광고" : id === "bots" ? "봇" : id === "know" ? "지식" : "PC"}
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-line bg-elev p-3">
        {dock === "pc" ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">PC</p>
            <p className="mt-2 text-sm">윈도우에서 접근성만 켜면 파일·앱을 씁니다. 사이트 비밀번호는 목록만.</p>
            <p className="mt-2 text-xs text-mute">크롬 가져오기: 즐겨찾기·기록. 로그인·쿠키는 허용 사이트만.</p>
          </>
        ) : dock === "know" ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">지식 수확</p>
            <p className="mt-2 text-sm">메뉴를 눈으로 보고 게시판을 연 뒤, 있는 지식과 비교해 새 것만 넣습니다.</p>
            <p className="mt-2 text-xs text-mute">잡담은 8B. 중요도는 GPU1 30B-A3B(활성 3B). 27B·35B 밀집은 느려서 안 씀.</p>
            <p className="mt-2 text-xs text-mute">공개 글만. 로그인 벽·대량 도배는 안 함.</p>
          </>
        ) : dock === "brief" ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">오늘</p>
            <p className="mt-2 text-sm">일과 → 12화면 → 승인 → 인수인계. 브랜드는 한 번에 하나.</p>
            <p className="mt-2 text-xs text-mute">조회 자동. 입찰·ON/OFF·목표는 대표 승인. 지식은 초안만.</p>
          </>
        ) : dock === "web" ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">작업</p>
            <div className="mt-2 grid max-h-64 gap-2 overflow-auto">
              {TASKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-task={t.id}
                  disabled={running}
                  onClick={() => chooseTask(t.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors",
                    task?.id === t.id ? "border-ink bg-paper-2" : "border-line hover:bg-paper-2",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t.title}</span>
                    {t.write ? <Lock className="size-3.5 text-warn" aria-hidden /> : <Eye className="size-3.5 text-mute" aria-hidden />}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-mute">{t.blurb}</span>
                </button>
              ))}
            </div>
          </>
        ) : dock === "skills" ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">스킬 팩</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setPack("all")}
                className={cn("h-8 rounded-md border px-2 text-[11px]", pack === "all" ? "border-ink bg-ink text-paper" : "border-line")}
              >
                전체
              </button>
              {PACKS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPack(p.id)}
                  className={cn("h-8 rounded-md border px-2 text-[11px]", pack === p.id ? "border-ink bg-ink text-paper" : "border-line")}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-2 grid max-h-64 gap-1 overflow-auto">
              {list.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-skill={s.id}
                  disabled={running}
                  onClick={() => chooseSkill(s.id)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-left",
                    skill?.id === s.id ? "border-ink bg-paper-2" : "border-line hover:bg-paper-2",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{s.title}</span>
                    {s.write ? <Lock className="size-3 text-warn" aria-hidden /> : <Eye className="size-3 text-mute" aria-hidden />}
                  </span>
                  <span className="block text-[10px] text-mute">
                    {s.path} · {s.source}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">게이트웨이</p>
            <p className="mt-2 text-xs leading-relaxed text-mute">
              Cron은 게이트웨이 프로세스에 둡니다. 메인 세션 heartbeat가 아니라 isolated job. 쓰기는 L4.
            </p>
          </>
        )}
        {dock !== "bots" && (
          <button
            type="button"
            data-run
            disabled={!task || running}
            onClick={() => void run()}
            className="mt-3 h-11 w-full rounded-lg bg-ink text-sm font-medium text-paper disabled:opacity-40"
          >
            {running ? "실행 중" : "루프 실행"}
          </button>
        )}
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-mute">
          <Eye className="size-3.5" /> 로컬 VL
        </p>
        <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-2">
          {vlText}
        </pre>
        <p className="mt-2 font-mono text-[10px] text-mute">
          SoM {marks.length} · {host}
        </p>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">타임라인</p>
        <ol className="mt-2 max-h-40 space-y-1 overflow-auto">
          {logs.length === 0 && <li className="text-xs text-mute">아직 스텝이 없습니다.</li>}
          {[...logs].reverse().map((l) => (
            <li key={l.t} className="flex gap-2 font-mono text-[11px] leading-snug">
              <span className="shrink-0 text-mute">{l.level ?? l.kind}</span>
              <span>{l.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">Qdrant</p>
        <ul className="mt-2 space-y-2">
          {docs.length === 0 && <li className="text-xs text-mute">실행하면 pages에 올라갑니다. 주소창 DB 아이콘.</li>}
          {docs.slice(0, 4).map((d) => (
            <li key={d.id} className="text-xs">
              <span className="font-medium">{d.title}</span>
              <span className="mt-0.5 block text-mute">{d.extract.slice(0, 72)}…</span>
            </li>
          ))}
        </ul>
      </section>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-line bg-elev p-5 shadow-lg">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Shield className="size-4 text-warn" /> L4 승인 · {pending.kind}
            </p>
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-paper-2 p-3 text-xs leading-relaxed">
              {pending.preview}
            </pre>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => decide(false)} className="h-11 flex-1 rounded-lg border border-line text-sm">
                거부
              </button>
              <button type="button" onClick={() => decide(true)} className="h-11 flex-1 rounded-lg bg-warn text-sm font-medium text-paper">
                승인하고 계속
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="hidden text-[10px] leading-relaxed text-mute lg:block">
        <MousePointer2 className="mr-1 inline size-3" />
        {shell.label} · {shell.paths.data}
      </p>
    </aside>
  );
}
