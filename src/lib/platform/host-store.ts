import { create } from "zustand";
import { canApp, canFile, canLogin } from "./host-access";

type Log = { t: string; ok: boolean };

type HS = {
  grant: Record<string, boolean>;
  l4: boolean;
  logs: Log[];
  toggle: (id: string) => void;
  setL4: (v: boolean) => void;
  tryLogin: (host: string) => void;
  tryFile: (path: string, write: boolean) => void;
  tryApp: (id: string) => void;
};

export const useHostAccess = create<HS>()((set, get) => ({
  grant: { a11y: false, input: false, files: true, excel: true, kakaotalk: false, telegram: false, lmstudio: true, grok: false, claude: false, vault: true },
  l4: false,
  logs: [],
  toggle: (id) => set((s) => ({ grant: { ...s.grant, [id]: !s.grant[id] } })),
  setL4: (v) => set({ l4: v }),
  tryLogin: (host) => {
    const r = canLogin(host, get().grant.vault);
    set((s) => ({ logs: [{ t: `로그인 ${host} · ${r.why}`, ok: r.ok }, ...s.logs].slice(0, 8) }));
  },
  tryFile: (path, write) => {
    const r = canFile(path, write, get().grant.files);
    set((s) => ({ logs: [{ t: `파일 ${write ? "쓰기" : "읽기"} · ${r.why}`, ok: r.ok }, ...s.logs].slice(0, 8) }));
  },
  tryApp: (id) => {
    const r = canApp(id, !!get().grant[id], get().l4);
    set((s) => ({ logs: [{ t: `앱 ${id} · ${r.why}`, ok: r.ok }, ...s.logs].slice(0, 8) }));
  },
}));
