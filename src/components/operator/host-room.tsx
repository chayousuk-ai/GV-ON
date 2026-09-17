import { ChromeImportPanel } from "@/components/operator/chrome-import-panel";
import { FleetPanel } from "@/components/operator/fleet-panel";
import { CAPS, FILE_ALLOW, SITE_ALLOW, setupLines } from "@/lib/platform/host-access";
import { useHostAccess } from "@/lib/platform/host-store";
import { useFleet } from "@/lib/adsops/fleet-store";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";

export function HostRoom() {
  const hostId = useEngine((s) => s.hostId);
  const pane = useFleet((s) => s.pane);
  const setPane = useFleet((s) => s.setPane);
  const { grant, l4, logs, toggle, setL4, tryLogin, tryFile, tryApp } = useHostAccess();
  const setup = setupLines(hostId);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex rounded-lg border border-line bg-elev p-1">
        {(["grant", "chrome", "fleet"] as const).map((id) => (
          <button
            key={id}
            type="button"
            data-pc-pane={id}
            onClick={() => setPane(id)}
            className={cn("h-9 flex-1 rounded-md text-[12px]", pane === id ? "bg-ink text-paper" : "text-ink-2")}
          >
            {id === "grant" ? "권한" : id === "chrome" ? "크롬" : "직원·스튜디오"}
          </button>
        ))}
      </div>

      {pane === "fleet" ? (
        <FleetPanel />
      ) : pane === "chrome" ? (
        <ChromeImportPanel />
      ) : (
        <>
      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">PC 권한 · 브라우저 밖</p>
        <p className="mt-1 text-sm">파일·프로그램·메신저·로컬 AI. 사이트 비밀번호는 허용 목록만.</p>
        <div className="mt-2 grid gap-1">
          {CAPS.map((c) => (
            <label key={c.id} className="flex items-center justify-between gap-2 rounded-md border border-line px-2 py-1.5">
              <span className="text-[12px]">
                {c.label}
                <span className="ml-2 font-mono text-[10px] text-mute">{c.how === "you" ? "윈도우에서 허용" : "앱이 처리"}</span>
              </span>
              <input type="checkbox" data-grant={c.id} checked={!!grant[c.id]} onChange={() => toggle(c.id)} />
            </label>
          ))}
        </div>
        <label className="mt-2 flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" data-l4 checked={l4} onChange={(e) => setL4(e.target.checked)} />
          L4 입력 승인 (메신저·OS 클릭)
        </label>
      </section>

      <section className="rounded-xl border border-line bg-paper p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">시험</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" data-try="naver" className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={() => tryLogin("ads.naver.com")}>
            네이버광고 로그인
          </button>
          <button type="button" data-try="bank" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryLogin("bank.example")}>
            목록 밖 로그인
          </button>
          <button type="button" data-try="read" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryFile("Documents/A-01) 광고_정기업무/notes.md", false)}>
            업무폴더 읽기
          </button>
          <button type="button" data-try="xlsx" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryFile("Documents/A-01) 광고_정기업무/실적.xlsx", true)}>
            엑셀 직접 쓰기
          </button>
          <button type="button" data-try="kakao" className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => tryApp("kakaotalk")}>
            카카오톡
          </button>
        </div>
        <ul className="mt-3 space-y-1">
          {logs.map((l, i) => (
            <li key={i} className={cn("font-mono text-[11px]", l.ok ? "" : "text-mute")}>
              {l.ok ? "허용" : "거부"} · {l.t}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">윈도우에서 직접</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed">
          {setup.you.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-mute">앱이 하는 일</p>
        <ul className="mt-1 space-y-1 text-[12px] text-mute">
          {setup.auto.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[10px] text-mute">허용 사이트 {SITE_ALLOW.length} · 폴더 {FILE_ALLOW.length}</p>
      </section>
        </>
      )}
    </div>
  );
}
