import { create } from "zustand";
import { CORPUS, PORTALS, TASKS } from "./data";
import { DEFAULT_DEVICE, deviceById } from "./devices";
import { hostOf, type HostId } from "../platform";
import { cadenceAdvance, hermesPlan, nextAt, SEED_BOTS, type Bot, type BotFile, type ChatMsg, type Job, type Plan } from "./bots";
import { CAMPAIGNS, GA_ROWS, KEYWORDS, SKILLS, type Skill } from "./skills";
import { loadBag, maskSecret, saveBag, SEED, type Bookmark, type ChromePanel, type MemoryHit, type Report, type VaultItem } from "./memory";
import { checkIntent, checkWrite, hashBody, type PolicyHit, type WriteRec } from "./policy";
import type { Level, LogLine, PageId, PortalState, SavedDoc, Session, SomMark, SurfaceId, TaskDef, WriteKind } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Pending = {
  kind: WriteKind;
  preview: string;
  resume: () => void;
  abort: () => void;
};

type Cursor = { x: number; y: number; down: boolean };

type Engine = {
  portal: SurfaceId;
  page: PageId;
  session: Session;
  portalState: PortalState;
  marks: SomMark[];
  cursor: Cursor;
  running: boolean;
  task?: TaskDef;
  logs: LogLine[];
  docs: SavedDoc[];
  vlText: string;
  pending?: Pending;
  lastKeyword?: string;
  deviceId: string;
  hostId: HostId;
  dock: "brief" | "web" | "skills" | "bots" | "know" | "pc";
  skill?: Skill;
  bots: Bot[];
  botId: string;
  chats: Record<string, ChatMsg[]>;
  files: Record<string, BotFile[]>;
  jobs: Job[];
  plan?: Plan;
  chrome: ChromePanel;
  bookmarks: Bookmark[];
  vault: VaultItem[];
  memories: MemoryHit[];
  reports: Report[];
  writes: WriteRec[];
  policyHits: PolicyHit[];
  setMarks: (marks: SomMark[]) => void;
  setPortalPage: (page: PageId, patch?: Partial<PortalState>) => void;
  setDevice: (id: string) => void;
  setHost: (id: HostId) => void;
  setDock: (dock: "brief" | "web" | "skills" | "bots" | "know" | "pc") => void;
  chooseTask: (id: string) => void;
  chooseSkill: (id: string) => void;
  selectBot: (id: string) => void;
  createBot: (name: string, job: string) => void;
  sendChat: (text: string) => void;
  attachFile: (file: BotFile) => void;
  confirmPlan: () => void;
  pauseJob: (id: string) => void;
  tickJobs: () => void;
  openChrome: (p: ChromePanel) => void;
  toggleBookmark: () => void;
  openBookmark: (id: string) => void;
  saveVault: () => void;
  compileReport: () => void;
  hydrateChrome: () => void;
  run: () => Promise<void>;
  decide: (ok: boolean) => void;
  clearLogs: () => void;
};

function startPage(portal: SurfaceId, override?: PageId): PageId {
  if (override) return override;
  if (portal === "tiktok" || portal === "instagram") return "feed";
  if (portal === "ga4" || portal === "nstat") return "analytics";
  if (portal === "gads" || portal === "nads" || portal === "kmoment" || portal === "metaads") return "ads";
  if (portal === "ali1688") return "search";
  return "search";
}

function emptyPortal(portal: SurfaceId, keyword = ""): PortalState {
  return {
    page: "search",
    query: keyword,
    results: CORPUS[portal],
    draftTitle: "",
    draftBody: "",
    comments: [],
    published: [],
    campaigns: (CAMPAIGNS[portal] ?? []).map((c) => ({ ...c })),
  };
}

let seq = 0;
function log(kind: LogLine["kind"], text: string, level?: Level): LogLine {
  return { t: Date.now() + seq++, kind, text, level };
}

function bootBag() {
  return structuredClone(SEED);
}

function persistChrome(s: { bookmarks: Bookmark[]; vault: VaultItem[]; memories: MemoryHit[]; reports: Report[] }) {
  saveBag({ bookmarks: s.bookmarks, vault: s.vault, memories: s.memories, reports: s.reports });
}

export const useEngine = create<Engine>()((set, get) => ({
      portal: "naver",
      page: "search",
      session: { loggedIn: false, user: "gvon.local" },
      portalState: emptyPortal("naver", "로컬 VL 에이전트"),
      marks: [],
      cursor: { x: 40, y: 40, down: false },
      running: false,
      logs: [],
      docs: [],
      vlText: "대기. 작업을 고르면 로컬 VL이 뷰포트를 읽습니다.",
      lastKeyword: "로컬 VL 에이전트",
      deviceId: DEFAULT_DEVICE.id,
      hostId: "windows",
      dock: "brief",
      bots: SEED_BOTS,
      botId: "collect",
      chats: {
        collect: [
          {
            id: "c0",
            role: "system",
            text: "OpenClaw 게이트웨이 · Hermes 하네스. 채팅 또는 파일을 주면 방법·일정을 정합니다.",
            at: Date.now(),
          },
        ],
        ads: [],
        publish: [],
      },
      files: { collect: [], ads: [], publish: [] },
      jobs: [],
      plan: undefined,
      chrome: "none",
      writes: [],
      policyHits: [],
      ...bootBag(),

      setMarks: (marks) => set({ marks }),
      setDevice: (id) => {
        const d = deviceById(id);
        set({
          deviceId: d.id,
          vlText: `디바이스 ${d.label} · Chrome UA · touch=${d.touch} · dpr=${d.dpr}`,
        });
      },
      setHost: (id) => {
        const h = hostOf(id);
        set({
          hostId: id,
          vlText: `${h.label} · ${h.input} · 설치 ${h.installer}`,
        });
      },
      setDock: (dock) => set({ dock, chrome: "none" }),
      hydrateChrome: () => {
        if (typeof window === "undefined") return;
        set(loadBag());
      },
      openChrome: (p) => set((s) => ({ chrome: s.chrome === p ? "none" : p })),
      toggleBookmark: () => {
        const s = get();
        const host = PORTALS.find((p) => p.id === s.portal)?.host ?? s.portal;
        const hit = s.bookmarks.find((b) => b.portal === s.portal);
        const bookmarks = hit
          ? s.bookmarks.filter((b) => b.id !== hit.id)
          : [{ id: crypto.randomUUID(), title: host, host, portal: s.portal, at: Date.now() }, ...s.bookmarks].slice(0, 40);
        persistChrome({ ...s, bookmarks });
        set({ bookmarks, vlText: hit ? "북마크 해제. Qdrant bookmarks." : "북마크 저장. Qdrant bookmarks." });
      },
      openBookmark: (id) => {
        const b = get().bookmarks.find((x) => x.id === id);
        if (!b) return;
        set({
          portal: b.portal,
          portalState: emptyPortal(b.portal, get().lastKeyword ?? ""),
          page: startPage(b.portal),
          chrome: "none",
        });
      },
      saveVault: () => {
        const s = get();
        const host = PORTALS.find((p) => p.id === s.portal)?.host ?? s.portal;
        const item: VaultItem = {
          id: crypto.randomUUID(),
          host,
          user: s.session.user,
          cipher: maskSecret(),
          at: Date.now(),
        };
        const vault = [item, ...s.vault.filter((v) => v.host !== host)].slice(0, 40);
        persistChrome({ ...s, vault });
        set({ vault, vlText: "자격증명 Vault. 암호는 모델에 없음." });
      },
      compileReport: () => {
        const s = get();
        const body = s.docs.slice(0, 6).map((d) => `${d.title}: ${d.extract.slice(0, 80)}`).join("\n") || "아직 수집 없음.";
        const report: Report = {
          id: crypto.randomUUID(),
          title: `리포트 · ${new Date().toLocaleString("ko-KR")}`,
          kind: s.portal === "ga4" || s.portal === "nstat" ? "analytics" : s.portal.includes("ads") || s.portal === "gads" || s.portal === "nads" || s.portal === "kmoment" || s.portal === "metaads" ? "ads" : "ops",
          body,
          at: Date.now(),
        };
        const reports = [report, ...s.reports].slice(0, 30);
        persistChrome({ ...s, reports });
        set({ reports, chrome: "reports" });
      },
      setPortalPage: (page, patch) =>
        set((s) => ({
          page,
          portalState: { ...s.portalState, page, ...patch },
        })),
      chooseTask: (id) => {
        const task = TASKS.find((t) => t.id === id);
        if (!task || get().running) return;
        set({
          task,
          skill: undefined,
          portal: task.portal,
          portalState: emptyPortal(task.portal, task.keyword ?? get().lastKeyword ?? ""),
          page: startPage(task.portal, task.page),
          deviceId: task.deviceId ?? get().deviceId,
          vlText: `${PORTALS.find((p) => p.id === task.portal)?.name} · 준비됨`,
        });
      },
      chooseSkill: (id) => {
        const skill = SKILLS.find((s) => s.id === id);
        if (!skill || get().running) return;
        const task: TaskDef = {
          id: skill.id,
          title: skill.title,
          blurb: skill.blurb,
          portal: skill.surface,
          write: skill.write,
          deviceId: "pc-1440",
          page: skill.playbook === "ga4" ? "analytics" : skill.playbook === "setup" ? "ads" : "ads",
        };
        set({
          skill,
          task,
          dock: "skills",
          portal: skill.surface,
          portalState: emptyPortal(skill.surface),
          page: startPage(skill.surface, task.page),
          deviceId: "pc-1440",
          vlText: `${skill.title} · ${skill.path.toUpperCase()} · ${skill.source}`,
        });
      },
      selectBot: (id) => set({ botId: id, plan: undefined }),
      createBot: (name, job) => {
        const id = `bot-${Date.now()}`;
        const bot: Bot = { id, name: name.trim() || "새 봇", job: job.trim() || "역할 미정", skills: [], l4: true };
        set((s) => ({
          bots: [...s.bots, bot],
          botId: id,
          chats: {
            ...s.chats,
            [id]: [{ id: `${id}-sys`, role: "system", text: "세션 시작. 목표를 말하면 Hermes가 방법을 정합니다.", at: Date.now() }],
          },
          files: { ...s.files, [id]: [] },
        }));
      },
      sendChat: (text) => {
        const t = text.trim();
        if (!t) return;
        const botId = get().botId;
        const files = get().files[botId] ?? [];
        const plan = hermesPlan(t, files);
        const user: ChatMsg = { id: crypto.randomUUID(), role: "user", text: t, at: Date.now() };
        const reply: ChatMsg = {
          id: crypto.randomUUID(),
          role: "hermes",
          text: [
            `방법: ${plan.method}`,
            `스킬: ${plan.skillHint}`,
            `일정: ${plan.cadence.label}${plan.cadence.expr ? ` (${plan.cadence.expr})` : ""}`,
            `세션: ${plan.session}`,
            `검사점: ${plan.checkpoint}`,
            "확정하면 isolated job으로 올립니다.",
          ].join("\n"),
          at: Date.now() + 1,
        };
        set((s) => ({
          plan,
          chats: { ...s.chats, [botId]: [...(s.chats[botId] ?? []), user, reply] },
        }));
      },
      attachFile: (file) => {
        const botId = get().botId;
        set((s) => ({
          files: { ...s.files, [botId]: [...(s.files[botId] ?? []), file].slice(-8) },
          chats: {
            ...s.chats,
            [botId]: [
              ...(s.chats[botId] ?? []),
              { id: crypto.randomUUID(), role: "system", text: `첨부 ${file.name} (${file.bytes}B). 플랜 컨텍스트.`, at: Date.now() },
            ],
          },
        }));
      },
      confirmPlan: () => {
        const plan = get().plan;
        const botId = get().botId;
        if (!plan) return;
        if (plan.blocked) {
          const hit: PolicyHit = { at: Date.now(), code: "NO-FAKE-ENG", ok: false, text: plan.blocked };
          set((s) => ({
            plan: undefined,
            policyHits: [hit, ...s.policyHits].slice(0, 40),
            chrome: "policy",
            chats: {
              ...s.chats,
              [botId]: [
                ...(s.chats[botId] ?? []),
                { id: crypto.randomUUID(), role: "system", text: `정책 거절 · ${plan.blocked}`, at: Date.now() },
              ],
            },
          }));
          return;
        }
        const job: Job = {
          id: crypto.randomUUID(),
          botId,
          title: plan.title,
          prompt: plan.method,
          cadence: plan.cadence,
          skillHint: plan.skillHint,
          isolated: true,
          status: "queued",
          nextAt: nextAt(plan.cadence),
        };
        set((s) => ({
          plan: undefined,
          jobs: [job, ...s.jobs].slice(0, 24),
          chats: {
            ...s.chats,
            [botId]: [
              ...(s.chats[botId] ?? []),
              { id: crypto.randomUUID(), role: "system", text: `job ${job.id.slice(0, 8)} queued · ${plan.cadence.label}`, at: Date.now() },
            ],
          },
        }));
      },
      pauseJob: (id) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: j.status === "paused" ? "queued" : "paused" } : j)),
        })),
      tickJobs: () => {
        const now = Date.now();
        const due = get().jobs.filter((j) => j.status === "queued" && j.nextAt <= now);
        if (!due.length) return;
        for (const job of due) {
          const bot = get().bots.find((b) => b.id === job.botId);
          const l4 = /발행|mutate|중지|예산/.test(job.prompt) || bot?.l4 && job.skillHint === "compose";
          const logLine = l4
            ? `${job.skillHint} 초안 완료. L4 대기.`
            : `${job.skillHint} isolated run 완료. extract 저장.`;
          set((s) => ({
            jobs: s.jobs.map((j) =>
              j.id !== job.id
                ? j
                : {
                    ...j,
                    status: job.cadence.kind === "once" ? "done" : "queued",
                    nextAt: job.cadence.kind === "once" ? j.nextAt : cadenceAdvance(j.cadence, now),
                    lastLog: logLine,
                  },
            ),
            docs: [
              {
                id: crypto.randomUUID(),
                portal: "naver" as const,
                title: `${job.title} · ${job.skillHint}`,
                extract: logLine,
                url: `gvon://job/${job.id}`,
                at: now,
              },
              ...s.docs,
            ].slice(0, 24),
            chats: {
              ...s.chats,
              [job.botId]: [
                ...(s.chats[job.botId] ?? []),
                { id: crypto.randomUUID(), role: "hermes", text: `run · ${logLine}`, at: now },
              ],
            },
          }));
        }
      },
      clearLogs: () => set({ logs: [] }),
      decide: (ok) => {
        const p = get().pending;
        if (!p) return;
        set({ pending: undefined });
        if (ok) p.resume();
        else p.abort();
      },
      run: async () => {
        const job = get().task;
        if (!job || get().running) return;
        const intent = checkIntent(`${job.title} ${job.blurb} ${job.write ?? ""}`);
        if (!intent.ok) {
          const hit: PolicyHit = { at: Date.now(), code: intent.code, ok: false, text: intent.reason };
          set((s) => ({
            policyHits: [hit, ...s.policyHits].slice(0, 40),
            chrome: "policy",
            vlText: `정책 거절 · ${intent.code}`,
            logs: [log("gate", `거절 ${intent.code} · ${intent.reason}`, "L4"), ...s.logs].slice(0, 80),
          }));
          return;
        }
        const harvestKw = job.keyword ?? "로컬 VL 에이전트";
        const adaptKw = job.keyword ?? "Qdrant 하이브리드 검색";
        set({ running: true, logs: [log("observe", `작업 시작 · ${job.title}`)] });
        try {
          if (job.id === "harvest") await runHarvest();
          else if (job.id === "compose") await runCompose();
          else if (job.id === "comment") await runComment();
          else if (job.id === "vlscan") await runVlscan();
          else if (job.id === "adapt") await runAdapt();
          else if (job.id === "yt-harvest") await runHarvest("watch");
          else if (job.id === "ig-comment") await runComment();
          else if (job.id === "tt-scan") await runTtScan();
          else if (job.id === "fb-post") await runCompose();
          else if (get().skill) await runSkill();
          push("save", "run 종료. 원문은 JSONL, 인덱스는 Qdrant 라우팅 예정.");
        } catch (e) {
          const msg = e instanceof Error ? e.message : "중단";
          push("gate", msg);
        } finally {
          set({ running: false, cursor: { ...get().cursor, down: false } });
        }

        function push(kind: LogLine["kind"], text: string, level?: Level) {
          set((s) => ({ logs: [...s.logs, log(kind, text, level)] }));
        }

        async function moveTo(gvId: string, level: Level = "L1") {
          for (let i = 0; i < 20; i++) {
            if (get().marks.some((m) => m.gvId === gvId)) break;
            await sleep(80);
          }
          const mark = get().marks.find((m) => m.gvId === gvId);
          if (!mark) {
            push("vl", `L1 실패 · ${gvId} 없음. VL 승격.`, "L3");
            await sleep(280);
            const again = get().marks.find((m) => m.gvId === gvId);
            if (!again) throw new Error(`표적 없음: ${gvId}`);
            return moveMark(again, "L3");
          }
          return moveMark(mark, level);
        }

        async function moveMark(mark: SomMark, level: Level) {
          const jitterX = mark.x + mark.w * (0.4 + Math.random() * 0.2);
          const jitterY = mark.y + mark.h * (0.4 + Math.random() * 0.2);
          set({ cursor: { x: jitterX, y: jitterY, down: false } });
          push("act", `move → #${mark.id} ${mark.label}  (${Math.round(jitterX)},${Math.round(jitterY)})`, level);
          await sleep(420);
          set((s) => ({ cursor: { ...s.cursor, down: true } }));
          await sleep(90);
          set((s) => ({ cursor: { ...s.cursor, down: false } }));
        }

        async function typeInto(gvId: string, text: string, level: Level = "L1") {
          await moveTo(gvId, level);
          for (let i = 1; i <= text.length; i += Math.max(1, Math.round(text.length / 8))) {
            await sleep(50);
          }
          push("act", `type “${text.slice(0, 42)}${text.length > 42 ? "…" : ""}”`, level);
        }

        function approve(kind: WriteKind, preview: string) {
          const v = checkWrite(get().writes, kind, get().portal, preview);
          if (!v.ok) {
            const hit: PolicyHit = { at: Date.now(), code: v.code, ok: false, text: v.reason };
            set((s) => ({
              policyHits: [hit, ...s.policyHits].slice(0, 40),
              chrome: "policy",
              vlText: `정책 거절 · ${v.code}`,
            }));
            push("gate", `거절 ${v.code} · ${v.reason}`, "L4");
            return Promise.reject(new Error(v.reason));
          }
          return new Promise<void>((resolve, reject) => {
            push("gate", `L4 대기 · ${kind}`, "L4");
            set({
              pending: {
                kind,
                preview,
                resume: () => {
                  const rec: WriteRec = {
                    at: Date.now(),
                    kind,
                    portal: get().portal,
                    hash: hashBody(preview),
                  };
                  set((s) => ({ writes: [rec, ...s.writes].slice(0, 80) }));
                  resolve();
                },
                abort: () => reject(new Error("사람이 거부했습니다.")),
              },
            });
          });
        }

        function vlSee(text: string) {
          set({ vlText: text });
          push("vl", text.split("\n")[0], "L3");
        }

        async function runHarvest(next: PageId = "article") {
          const kw = harvestKw;
          const startPage: PageId = get().portal === "youtube" ? "search" : get().page === "feed" ? "feed" : "search";
          set((s) => ({
            lastKeyword: kw,
            portalState: { ...s.portalState, page: startPage, query: kw, results: CORPUS[s.portal] },
            page: startPage,
          }));
          await sleep(200);
          vlSee(`검색창과 결과 카드 ${get().marks.length}개. DOM 유효 → L1.`);
          if (startPage === "search") {
            await typeInto("search", kw);
            set((s) => ({ portalState: { ...s.portalState, query: kw } }));
            await moveTo("search-btn");
            await sleep(200);
          }
          const article = get().portalState.results[0];
          await moveTo("hit-0");
          set((s) => ({
            page: next,
            portalState: { ...s.portalState, page: next, open: article },
          }));
          await sleep(350);
          vlSee(`본문 ${article.body.length}자. extract 저장.`);
          const doc: SavedDoc = {
            id: crypto.randomUUID(),
            portal: get().portal,
            title: article.title,
            extract: article.body,
            url: `https://${PORTALS.find((p) => p.id === get().portal)?.host}/a/${article.id}`,
            at: Date.now(),
          };
          set((s) => ({ docs: [doc, ...s.docs].slice(0, 24) }));
          push("save", `ko_docs upsert · ${doc.title}`, "L1");
          push("memory", "같은 키워드 재검색 시 이 extract를 우선 랭크.", "L1");
        }

        async function runCompose() {
          set({ page: "login", portalState: { ...get().portalState, page: "login" } });
          await sleep(200);
          vlSee("로그인 폼. 비밀번호 픽셀은 VL 프롬프트에서 제외. Vault autofill.");
          await moveTo("id");
          await approve("login", `${get().session.user} @ ${get().portal} 세션을 열까요? 비밀번호는 모델에 전달되지 않습니다.`);
          set({ session: { loggedIn: true, user: "gvon.local" }, page: "compose", portalState: { ...get().portalState, page: "compose" } });
          push("act", "autofill 완료 · 세션 쿠키는 프로필에만", "L4");
          await sleep(250);
          const title = "이번 주 AX 수집 메모";
          const body = "로컬 VL이 화면을 보고, 셀렉터는 Qdrant code_chunks에 남긴다. 발행은 사람만.";
          await typeInto("title", title);
          set((s) => ({ portalState: { ...s.portalState, draftTitle: title } }));
          await typeInto("editor", body);
          set((s) => ({ portalState: { ...s.portalState, draftBody: body } }));
          await moveTo("publish");
          await approve("post", `제목: ${title}\n\n${body}`);
          set((s) => ({
            portalState: {
              ...s.portalState,
              published: [{ title, body }, ...s.portalState.published],
              draftTitle: "",
              draftBody: "",
            },
          }));
          push("save", "발행됨 · run_id 기록, 대량 루틴으로는 저장하지 않음", "L4");
        }

        async function runComment() {
          const article = CORPUS[get().portal][0];
          const fromFeed = get().portal === "instagram" || get().portal === "tiktok";
          if (fromFeed) {
            set({
              page: "feed",
              portalState: { ...get().portalState, page: "feed", results: CORPUS[get().portal] },
            });
            await sleep(280);
            await moveTo("hit-0");
          }
          set({
            page: "article",
            portalState: { ...get().portalState, page: "article", open: article },
          });
          await sleep(280);
          vlSee(`글 ‘${article.title}’. 댓글창 SoM 확인. 동일 문구 반복이면 중단 규칙.`);
          await moveTo("comment");
          const text = "본문 저장 흐름 확인했습니다. 셀렉터는 다음 run에 재사용.";
          await typeInto("comment", text);
          set((s) => ({ portalState: { ...s.portalState, comments: [...s.portalState.comments, text] } }));
          await moveTo("comment-submit");
          await approve("comment", text);
          push("save", "댓글 1 · 동일 본문 반복 루틴 생성 안 함", "L4");
        }

        async function runVlscan() {
          set({ page: "search", portalState: { ...get().portalState, page: "search" } });
          await sleep(200);
          const marks = get().marks;
          const lines = marks
            .slice(0, 8)
            .map((m) => `#${m.id} ${m.role} “${m.label}” @ ${Math.round(m.x)},${Math.round(m.y)} ${Math.round(m.w)}×${Math.round(m.h)}`);
          vlSee(`전면 샷 1440×900 (시뮬). 표시 ${marks.length}개.\n${lines.join("\n")}`);
          push("observe", `SoM ${marks.length} · 좌표는 논리 뷰포트 기준`, "L3");
          if (marks[1]) await moveMark(marks[1], "L3");
        }

        async function runTtScan() {
          set({
            page: "feed",
            portalState: { ...get().portalState, page: "feed", results: CORPUS.tiktok },
          });
          await sleep(280);
          const marks = get().marks;
          vlSee(`클립랩 모바일 전면. SoM ${marks.length}. 사이트는 Chrome Mobile UA를 봄.`);
          push("observe", `터치 타깃 · dpr=${deviceById(get().deviceId).dpr}`, "L3");
          if (marks[0]) await moveMark(marks[0], "L3");
        }

        async function runAdapt() {
          const prev = get().docs[0];
          const kw = adaptKw;
          push("memory", prev ? `유사 run: ${prev.title}` : "이전 harvest 없음. 새 검색으로 응용.", "L2");
          set({
            portal: "community",
            lastKeyword: kw,
            portalState: emptyPortal("community", kw),
            page: "search",
          });
          await sleep(240);
          vlSee("면이 바뀜. 셀렉터 playbook은 폐기, 글 구조만 재사용.");
          await typeInto("search", kw);
          set((s) => ({ portalState: { ...s.portalState, query: kw } }));
          await moveTo("search-btn");
          const hit = CORPUS.community[0];
          await moveTo("hit-0");
          set((s) => ({
            page: "article",
            portalState: { ...s.portalState, page: "article", open: hit },
          }));
          const doc: SavedDoc = {
            id: crypto.randomUUID(),
            portal: "community",
            title: hit.title,
            extract: hit.body,
            url: `https://board.lab/a/${hit.id}`,
            at: Date.now(),
          };
          set((s) => ({ docs: [doc, ...s.docs].slice(0, 24) }));
          push("save", "응용 저장 · 원문 복붙 발행 없음", "L1");
        }

        async function runSkill() {
          const skill = get().skill;
          if (!skill) return;
          push("observe", `${skill.path} · ${skill.source}`);
          const pb = skill.playbook;
          if (pb === "setup") {
            set({ page: "ads", portalState: { ...get().portalState, page: "ads" } });
            await sleep(200);
            vlSee("인증 안내만. 토큰은 Vault. 모델에 비밀키 없음.");
            await moveTo("ads-help");
            push("memory", skill.tools.join(" · "));
            return;
          }
          if (pb === "ga4") {
            set({ page: "analytics", portalState: { ...get().portalState, page: "analytics" } });
            await sleep(220);
            vlSee(`채널 ${GA_ROWS.length} · Data API run_report 흉내.`);
            await moveTo("kpi-0");
            const extract = GA_ROWS.map((r) => `${r.ch} s=${r.sessions} c=${r.conv}`).join(" | ");
            saveDoc(`${skill.title} · 채널`, extract);
            return;
          }
          if (pb === "keywords") {
            set({ page: "ads", portalState: { ...get().portalState, page: "ads" } });
            await sleep(220);
            vlSee(`키워드 ${KEYWORDS.length}. QC·CTR.`);
            await moveTo("kw-0");
            const extract = KEYWORDS.map((k) => `${k.kw} qc=${k.qc}`).join(" | ");
            saveDoc(`${skill.title}`, extract);
            if (skill.write) {
              await moveTo("kw-neg");
              await approve("budget", `제외키워드 초안: ${KEYWORDS[2].kw}\n라이브 반영은 승인 후에만.`);
              push("save", "제외키워드 초안만 저장", "L4");
            }
            return;
          }
          set({ page: "ads", portalState: { ...get().portalState, page: "ads" } });
          await sleep(220);
          const rows = get().portalState.campaigns;
          vlSee(`캠페인 ${rows.length}. ${skill.tools[0]}`);
          await moveTo("row-0");
          saveDoc(
            `${skill.title} · ${rows[0]?.name ?? "empty"}`,
            rows.map((c) => `${c.name} ${c.status} ₩${c.spend} clk=${c.clicks}`).join(" | "),
          );
          if (pb === "pause") {
            await moveTo("pause-0");
            await approve("pause", `${rows[0]?.name} 을 PAUSED 초안으로 둘까요? 라이브 mutate는 승인 후.`);
            set((s) => ({
              portalState: {
                ...s.portalState,
                campaigns: s.portalState.campaigns.map((c, i) => (i === 0 ? { ...c, status: "PAUSED" } : c)),
              },
            }));
            push("save", "상태 PAUSED · 초안", "L4");
          }
          if (pb === "budget") {
            await moveTo("budget-0");
            await approve("budget", `${rows[0]?.name} 일예산 변경 초안. 공유 예산은 거절.`);
            push("save", "예산 초안만. 라이브 아님", "L4");
          }
        }

        function saveDoc(title: string, extract: string) {
          const doc: SavedDoc = {
            id: crypto.randomUUID(),
            portal: get().portal,
            title,
            extract,
            url: `https://${PORTALS.find((p) => p.id === get().portal)?.host}/report`,
            at: Date.now(),
          };
          const mem: MemoryHit = {
            id: doc.id,
            collection: "pages",
            title,
            body: extract,
            url: doc.url,
            at: doc.at,
          };
          set((s) => {
            const memories = [mem, ...s.memories].slice(0, 80);
            persistChrome({ ...s, memories });
            return { docs: [doc, ...s.docs].slice(0, 24), memories };
          });
          push("save", `${title} · Qdrant pages`, "L1");
        }
      },
    }));

