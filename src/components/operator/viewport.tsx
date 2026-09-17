import { useEffect, useRef, useState } from "react";
import { PORTALS } from "@/lib/operator/data";
import { DEVICES, deviceById } from "@/lib/operator/devices";
import { ChromeBar } from "@/components/operator/chrome";
import { hostOf } from "@/lib/platform";
import { useEngine } from "@/lib/operator/store";
import type { SomMark } from "@/lib/operator/types";
import { cn } from "@/lib/utils";

export function Viewport() {
  const wrap = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const {
    portal,
    page,
    portalState,
    session,
    cursor,
    running,
    deviceId,
    hostId,
    skill,
    setDevice,
    setMarks,
    setPortalPage,
  } = useEngine();
  const meta = PORTALS.find((p) => p.id === portal)!;
  const device = deviceById(deviceId);
  const host = hostOf(hostId);
  const ua = device.family === "pc" ? host.uaDesktop : device.ua;
  const platform = device.family === "pc" ? host.chPlatform : device.chPlatform;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth - 16;
      setScale(Math.min(1, w / device.w));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [device.w]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const nodes = el.querySelectorAll<HTMLElement>("[data-gv]");
      const marks: SomMark[] = [];
      let i = 1;
      nodes.forEach((n) => {
        const r = n.getBoundingClientRect();
        marks.push({
          id: i++,
          gvId: n.dataset.gv || "",
          role: n.dataset.role || n.tagName.toLowerCase(),
          label: (n.dataset.label || n.innerText || "").trim().slice(0, 32),
          x: r.left - box.left,
          y: r.top - box.top,
          w: r.width,
          h: r.height,
        });
      });
      setMarks(marks);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = window.setTimeout(measure, 50);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [page, portal, portalState.query, portalState.open, portalState.campaigns, session.loggedIn, deviceId, skill?.id, setMarks]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            disabled={running}
            onClick={() => setDevice(d.id)}
            className={cn(
              "h-9 rounded-md border px-2.5 text-[11px] font-medium",
              d.id === device.id ? "border-ink bg-ink text-paper" : "border-line bg-elev text-ink-2",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div ref={wrap} className="min-w-0 overflow-x-auto rounded-xl border border-line bg-paper-2 p-2">
        <div
          className="origin-top-left"
          style={{ width: device.w * scale, height: Math.min(device.h, 760) * scale }}
        >
          <div
            ref={root}
            className={cn(
              "relative overflow-hidden bg-paper text-ink",
              device.family === "mobile" ? "rounded-[1.6rem]" : "rounded-lg",
            )}
            style={{
              width: device.w,
              height: Math.min(device.h, 760),
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-35"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid) 1px, transparent 1px)",
                backgroundSize: "10% 10%",
              }}
            />
            <ChromeBar host={meta.host} page={page} user={session.loggedIn ? session.user : "익명"} />

            {page === "search" && (
              <SearchPage
                query={portalState.query}
                results={portalState.results}
                onOpen={(id) => {
                  const open = portalState.results.find((a) => a.id === id);
                  if (open) setPortalPage(portal === "youtube" ? "watch" : "article", { open });
                }}
              />
            )}
            {page === "feed" && (
              <FeedPage
                vertical={portal === "tiktok"}
                results={portalState.results}
                onOpen={(id) => {
                  const open = portalState.results.find((a) => a.id === id);
                  if (open) setPortalPage(portal === "tiktok" ? "watch" : "article", { open });
                }}
              />
            )}
            {(page === "article" || page === "watch") && portalState.open && (
              <ArticlePage
                watch={page === "watch"}
                title={portalState.open.title}
                body={portalState.open.body}
                comments={portalState.comments}
                onBack={() => setPortalPage(portal === "instagram" || portal === "tiktok" ? "feed" : "search")}
              />
            )}
            {page === "compose" && (
              <ComposePage title={portalState.draftTitle} body={portalState.draftBody} published={portalState.published} />
            )}
            {page === "login" && <LoginPage />}
            {page === "ads" && (
              <AdsPage
                campaigns={portalState.campaigns}
                keywords={skill?.playbook === "keywords"}
                setup={skill?.playbook === "setup"}
              />
            )}
            {page === "analytics" && <AnalyticsPage />}

            <Cursor x={cursor.x} y={cursor.y} down={cursor.down} active={running} />
          </div>
        </div>
      </div>

      <p className="truncate font-mono text-[10px] leading-relaxed text-mute" title={ua}>
        UA · {device.chMobile === "?1" ? "Mobile " : ""}
        {platform} · {device.w}×{device.h} · {host.label} · 서버에는 GV-ON 없음
      </p>
    </div>
  );
}

function SearchPage({
  query,
  results,
  onOpen,
}: {
  query: string;
  results: { id: string; title: string; source: string; body: string }[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex gap-2">
        <input
          data-gv="search"
          data-role="textbox"
          data-label="검색"
          value={query}
          readOnly
          className="h-11 flex-1 rounded-md border border-line bg-paper px-3 text-sm"
        />
        <button
          data-gv="search-btn"
          data-role="button"
          data-label="검색"
          className="h-11 rounded-md bg-ink px-4 text-sm font-medium text-paper"
          type="button"
        >
          검색
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {results.map((r, i) => (
          <li key={r.id}>
            <button
              type="button"
              data-gv={`hit-${i}`}
              data-role="link"
              data-label={r.title}
              onClick={() => onOpen(r.id)}
              className="w-full rounded-lg border border-transparent px-2 py-2 text-left hover:border-line hover:bg-paper-2"
            >
              <p className="text-[11px] text-mute">{r.source}</p>
              <p className="text-sm font-medium text-accent">{r.title}</p>
              <p className="line-clamp-2 text-xs text-mute">{r.body}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeedPage({
  vertical,
  results,
  onOpen,
}: {
  vertical: boolean;
  results: { id: string; title: string; source: string; body: string }[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className={cn("p-3", vertical ? "space-y-3" : "grid grid-cols-2 gap-2")}>
      {results.map((r, i) => (
        <button
          key={r.id}
          type="button"
          data-gv={`hit-${i}`}
          data-role="link"
          data-label={r.title}
          onClick={() => onOpen(r.id)}
          className={cn(
            "rounded-xl border border-line bg-paper-2 text-left",
            vertical ? "min-h-52 p-4" : "aspect-square p-3",
          )}
        >
          <p className="text-[10px] text-mute">{r.source}</p>
          <p className="mt-1 text-sm font-medium">{r.title}</p>
          <p className="mt-2 line-clamp-3 text-xs text-mute">{r.body}</p>
        </button>
      ))}
    </div>
  );
}

function ArticlePage({
  watch,
  title,
  body,
  comments,
  onBack,
}: {
  watch?: boolean;
  title: string;
  body: string;
  comments: string[];
  onBack: () => void;
}) {
  return (
    <div className="p-4">
      <button type="button" data-gv="back" data-role="button" data-label="목록" onClick={onBack} className="text-xs text-mute">
        ← 목록
      </button>
      {watch && (
        <div
          data-gv="player"
          data-role="video"
          data-label="플레이어"
          className="mt-2 flex aspect-video items-center justify-center rounded-lg bg-ink text-xs text-paper"
        >
          플레이어
        </div>
      )}
      <h2 className="mt-2 text-lg font-medium tracking-tight">{title}</h2>
      <p data-gv="article-body" data-role="article" data-label="본문" className="mt-3 text-sm leading-relaxed text-ink-2">
        {body}
      </p>
      <div className="mt-6 border-t border-line pt-3">
        <p className="text-xs font-medium text-mute">댓글</p>
        <ul className="mt-2 space-y-1 text-sm">
          {comments.map((c, i) => (
            <li key={i} className="rounded-md bg-paper-2 px-2 py-1">
              {c}
            </li>
          ))}
        </ul>
        <textarea
          data-gv="comment"
          data-role="textbox"
          data-label="댓글"
          readOnly
          rows={2}
          className="mt-2 w-full rounded-md border border-line bg-paper px-2 py-2 text-sm"
          placeholder="댓글"
        />
        <button
          type="button"
          data-gv="comment-submit"
          data-role="button"
          data-label="댓글 등록"
          className="mt-2 h-10 rounded-md bg-ink px-3 text-sm text-paper"
        >
          등록
        </button>
      </div>
    </div>
  );
}

function ComposePage({
  title,
  body,
  published,
}: {
  title: string;
  body: string;
  published: { title: string; body: string }[];
}) {
  return (
    <div className="p-4">
      <p className="text-xs text-mute">글쓰기</p>
      <input
        data-gv="title"
        data-role="textbox"
        data-label="제목"
        readOnly
        value={title}
        placeholder="제목"
        className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
      />
      <textarea
        data-gv="editor"
        data-role="textbox"
        data-label="본문 에디터"
        readOnly
        value={body}
        rows={6}
        placeholder="본문"
        className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      <button
        type="button"
        data-gv="publish"
        data-role="button"
        data-label="발행"
        className="mt-2 h-11 rounded-md bg-warn px-4 text-sm font-medium text-paper"
      >
        발행
      </button>
      {published[0] && <p className="mt-3 text-xs text-ok">최근 발행: {published[0].title}</p>}
    </div>
  );
}

function AdsPage({
  campaigns,
  keywords,
  setup,
}: {
  campaigns: { id: string; name: string; status: "ENABLED" | "PAUSED"; spend: number; clicks: number; impr: number }[];
  keywords?: boolean;
  setup?: boolean;
}) {
  if (setup) {
    return (
      <div className="p-4">
        <p className="text-sm font-medium">MCP 셋업</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          개발자 토큰·OAuth는 Vault. 공식 스킬 google-ads-api-mcp-setup / quickstart. 이 화면에는 비밀값이 없습니다.
        </p>
        <button
          type="button"
          data-gv="ads-help"
          data-role="button"
          data-label="셋업 메모"
          className="mt-4 h-11 rounded-md border border-line px-4 text-sm"
        >
          셋업 메모 열기
        </button>
      </div>
    );
  }
  if (keywords) {
    return (
      <div className="p-4">
        <p className="text-xs text-mute">키워드 도구</p>
        <ul className="mt-3 space-y-2">
          {["로컬 VL 에이전트", "AX 브라우저", "검색광고 자동화"].map((kw, i) => (
            <li key={kw}>
              <button
                type="button"
                data-gv={`kw-${i}`}
                data-role="row"
                data-label={kw}
                className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm"
              >
                {kw}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          data-gv="kw-neg"
          data-role="button"
          data-label="제외 초안"
          className="mt-3 h-11 rounded-md bg-warn px-4 text-sm text-paper"
        >
          제외키워드 초안
        </button>
      </div>
    );
  }
  return (
    <div className="p-4">
      <p className="text-xs text-mute">캠페인 · 로고 없는 랩 콘솔</p>
      <div className="mt-3 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-paper-2 text-mute">
            <tr>
              <th className="px-3 py-2 font-medium">캠페인</th>
              <th className="px-3 py-2 font-medium">상태</th>
              <th className="px-3 py-2 font-medium">소진</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-3 py-2">
                  <button type="button" data-gv={`row-${i}`} data-role="row" data-label={c.name} className="text-sm font-medium">
                    {c.name}
                  </button>
                </td>
                <td className="px-3 py-2 font-mono">{c.status}</td>
                <td className="px-3 py-2 font-mono">₩{c.spend.toLocaleString("ko-KR")}</td>
                <td className="px-3 py-2">
                  {i === 0 && (
                    <div className="flex gap-1">
                      <button type="button" data-gv="pause-0" data-role="button" data-label="일시중지" className="h-9 rounded-md border border-line px-2">
                        중지
                      </button>
                      <button type="button" data-gv="budget-0" data-role="button" data-label="예산" className="h-9 rounded-md border border-line px-2">
                        예산
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="p-4">
      <p className="text-xs text-mute">채널 리포트</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          ["세션", "8,920"],
          ["전환", "110"],
          ["실시간", "42"],
          ["유료검색", "1,680"],
        ].map(([k, v], i) => (
          <button
            key={k}
            type="button"
            data-gv={`kpi-${i}`}
            data-role="meter"
            data-label={k}
            className="rounded-lg border border-line bg-paper-2 px-3 py-3 text-left"
          >
            <p className="text-[11px] text-mute">{k}</p>
            <p className="font-mono text-lg">{v}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="flex flex-col items-center p-8">
      <p className="text-sm font-medium">세션 열기</p>
      <p className="mt-1 text-xs text-mute">비밀번호는 이 화면에만 채워지고 모델 컨텍스트에서 잘립니다.</p>
      <input
        data-gv="id"
        data-role="textbox"
        data-label="아이디"
        readOnly
        value="gvon.local"
        className="mt-4 h-11 w-full max-w-sm rounded-md border border-line px-3 text-sm"
      />
      <input
        data-gv="pw"
        data-role="textbox"
        data-label="비밀번호"
        readOnly
        type="password"
        value="********"
        className="mt-2 h-11 w-full max-w-sm rounded-md border border-line px-3 text-sm"
      />
      <button type="button" data-gv="login-btn" data-role="button" data-label="로그인" className="mt-3 h-11 w-full max-w-sm rounded-md bg-ink text-sm text-paper">
        로그인
      </button>
      <p className="mt-2 max-w-sm text-[11px] text-mute">저장은 주소창 오른쪽 열쇠. 암호는 Vault만.</p>
    </div>
  );
}

function Cursor({ x, y, down, active }: { x: number; y: number; down: boolean; active: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 -translate-x-1 -translate-y-1 transition-transform duration-300 ease-out",
        active ? "opacity-100" : "opacity-40",
      )}
      style={{ transform: `translate(${x}px, ${y}px) scale(${down ? 0.86 : 1})` }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <path d="M3 2 L3 18 L8 13 L12 21 L15 20 L11 12 L19 12 Z" fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="1" />
      </svg>
    </div>
  );
}
