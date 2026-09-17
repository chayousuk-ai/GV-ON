import { CHROME_FILES, CHROME_ROOT } from "@/lib/platform/chrome-import";
import { useChromeImport } from "@/lib/platform/chrome-import-store";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";

export function ChromeImportPanel() {
  const hostId = useEngine((s) => s.hostId);
  const { closed, grant, done, logs, setClosed, setGrant, scan, apply } = useChromeImport();
  const root = hostId === "darwin" ? CHROME_ROOT.darwin : CHROME_ROOT.windows;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">크롬에서 가져오기</p>
        <p className="mt-1 text-sm">즐겨찾기·기록은 전부. 로그인·쿠키는 광고·분석 허용 사이트만. 암호는 금고 점만.</p>
        <p className="mt-2 font-mono text-[10px] text-mute">{root} · {CHROME_FILES.join(" · ")}</p>
        <label className="mt-2 flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" data-chrome-closed checked={closed} onChange={(e) => setClosed(e.target.checked)} />
          크롬을 종료했다
        </label>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" data-chrome-grant checked={grant} onChange={(e) => setGrant(e.target.checked)} />
          이 PC 크롬 프로필 읽기 허용
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" data-chrome-scan className="h-9 rounded-md border border-line px-3 text-sm" onClick={scan}>
            스캔
          </button>
          <button type="button" data-chrome-apply className="h-9 rounded-md bg-ink px-3 text-sm text-paper" onClick={apply}>
            가져오기
          </button>
        </div>
      </section>

      {done && (
        <section className="rounded-xl border border-line bg-paper p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-mute">결과</p>
          <p className="mt-1 text-sm">
            즐겨찾기 {done.counts.bookmark} · 기록 {done.counts.history} · 금고 {done.counts.login} · 쿠키 {done.counts.cookie}
          </p>
          <ul className="mt-2 space-y-1">
            {done.skip.map((d, i) => (
              <li key={i} className="font-mono text-[11px] text-mute">
                건너뜀 · {d.row.host} · {d.why}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-line bg-elev p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-mute">윈도우에서 직접</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed">
          <li>크롬을 완전히 종료 (잠긴 DB는 복사가 안 됨)</li>
          <li>가져오기 허용. Windows가 자격 증명 보호를 물으면 허용</li>
          <li>은행 등 목록 밖 비밀번호·쿠키는 안 옮김</li>
          <li>Grok 격리 프로필에는 쿠키를 넣지 않음</li>
        </ol>
      </section>

      <ul className="space-y-1">
        {logs.map((l, i) => (
          <li key={i} className={cn("font-mono text-[11px]", l.ok ? "" : "text-mute")}>
            {l.ok ? "됨" : "안 됨"} · {l.t}
          </li>
        ))}
      </ul>
    </div>
  );
}
