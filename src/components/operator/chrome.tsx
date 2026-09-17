import { useEffect } from "react";
import { Bookmark, Database, FileBarChart, KeyRound, Shield, Star } from "lucide-react";
import { PORTALS } from "@/lib/operator/data";
import { RULES } from "@/lib/operator/policy";
import { useEngine } from "@/lib/operator/store";
import { cn } from "@/lib/utils";

export function ChromeBar({
  host,
  page,
  user,
}: {
  host: string;
  page: string;
  user: string;
}) {
  const {
    chrome,
    bookmarks,
    vault,
    memories,
    reports,
    policyHits,
    portal,
    openChrome,
    toggleBookmark,
    openBookmark,
    saveVault,
    compileReport,
    hydrateChrome,
  } = useEngine();
  const starred = bookmarks.some((b) => b.portal === portal);
  const url = `https://${host}/${page}`;

  useEffect(() => {
    hydrateChrome();
  }, [hydrateChrome]);

  return (
    <div className="relative z-30 border-b border-line bg-paper-2">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          data-chrome="bookmarks"
          onClick={() => openChrome("bookmarks")}
          className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
          aria-label="즐겨찾기"
        >
          <Bookmark className="size-4" />
        </button>
        <button
          type="button"
          data-chrome="star"
          onClick={() => toggleBookmark()}
          className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
          aria-label="현재 페이지 북마크"
        >
          <Star className={cn("size-4", starred && "fill-ink")} />
        </button>
        <input
          readOnly
          value={url}
          data-gv="omnibox"
          data-role="textbox"
          data-label="주소"
          className="h-8 w-44 shrink-0 truncate rounded-md border border-line bg-paper px-2 font-mono text-[11px] sm:w-56"
        />
        <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] text-paper">Chrome</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            data-chrome="policy"
            onClick={() => openChrome("policy")}
            className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
            aria-label="정책 실드"
          >
            <Shield className="size-4" />
          </button>
          <button
            type="button"
            data-chrome="vault"
            onClick={() => openChrome("vault")}
            className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
            aria-label="암호 금고"
          >
            <KeyRound className="size-4" />
          </button>
          <button
            type="button"
            data-chrome="memory"
            onClick={() => openChrome("memory")}
            className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
            aria-label="Qdrant 기록"
          >
            <Database className="size-4" />
          </button>
          <button
            type="button"
            data-chrome="reports"
            onClick={() => openChrome("reports")}
            className="flex size-9 items-center justify-center rounded-md hover:bg-paper"
            aria-label="리포트"
          >
            <FileBarChart className="size-4" />
          </button>
          <span className="hidden px-1 text-[10px] text-mute sm:inline">{user}</span>
        </div>
      </div>

      {chrome === "bookmarks" && (
        <ul className="max-h-48 space-y-1 overflow-auto border-t border-line bg-paper px-3 py-2">
          {bookmarks.length === 0 && <li className="text-xs text-mute">별표로 저장하세요.</li>}
          {bookmarks.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => openBookmark(b.id)} className="w-full text-left text-sm">
                {b.title}
                <span className="ml-2 font-mono text-[10px] text-mute">{b.host}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {chrome === "vault" && (
        <div className="border-t border-line bg-paper px-3 py-2">
          <p className="text-[11px] text-mute">암호는 Vault. VL 프롬프트에 안 넣음.</p>
          <ul className="mt-2 space-y-1">
            {vault.map((v) => (
              <li key={v.id} className="font-mono text-xs">
                {v.host} · {v.user} · {v.cipher}
              </li>
            ))}
          </ul>
          <button type="button" data-save-vault onClick={() => saveVault()} className="mt-2 h-9 rounded-md border border-line px-3 text-xs">
            이 사이트 저장
          </button>
        </div>
      )}
      {chrome === "memory" && (
        <ul className="max-h-52 space-y-1 overflow-auto border-t border-line bg-paper px-3 py-2">
          {memories.length === 0 && <li className="text-xs text-mute">작업 실행 시 pages/runs에 upsert.</li>}
          {memories.slice(0, 12).map((m) => (
            <li key={m.id} className="text-xs">
              <span className="font-mono text-[10px] text-mute">{m.collection}</span> {m.title}
            </li>
          ))}
        </ul>
      )}
      {chrome === "policy" && (
        <div className="max-h-56 overflow-auto border-t border-line bg-paper px-3 py-2">
          <p className="text-[11px] text-mute">우회 없음. 스팸이면 거절. 캡차·IP·허위클릭 솔버 없음.</p>
          <ul className="mt-2 space-y-1.5">
            {RULES.map((r) => (
              <li key={r.code} className="text-xs">
                <span className="font-mono text-[10px] text-mute">{r.code}</span> {r.title}
                <span className="mt-0.5 block text-[11px] text-mute">{r.detail}</span>
              </li>
            ))}
          </ul>
          {policyHits[0] && (
            <p className="mt-2 rounded-md bg-paper-2 px-2 py-1 text-[11px]">최근 거절 · {policyHits[0].code} · {policyHits[0].text}</p>
          )}
        </div>
      )}
      {chrome === "reports" && (
        <div className="max-h-52 overflow-auto border-t border-line bg-paper px-3 py-2">
          <button type="button" data-compile-report onClick={() => compileReport()} className="h-9 rounded-md bg-ink px-3 text-xs text-paper">
            지금 리포트 만들기
          </button>
          <ul className="mt-2 space-y-2">
            {reports.map((r) => (
              <li key={r.id}>
                <p className="text-xs font-medium">{r.title}</p>
                <p className="text-[11px] text-mute">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function chromeHost(portal: string) {
  return PORTALS.find((p) => p.id === portal)?.host ?? portal;
}
