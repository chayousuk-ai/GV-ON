import { app, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.GVON_PORT || "17331";
const URL = `http://127.0.0.1:${PORT}/`;

function nodeBin() {
  return process.env.npm_node_execpath || "node";
}

async function waitUp() {
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    try {
      const r = await fetch(URL);
      if (r.ok) return;
    } catch {
      /* not yet */
    }
    await sleep(400);
  }
  throw new Error("GV-ON 서버가 켜지지 않았습니다. Node 22와 npm install 을 확인하세요.");
}

let child;

app.whenReady().then(async () => {
  child = spawn(nodeBin(), ["scripts/with-app-env.mjs", "vite", "dev", "--host", "127.0.0.1", "--port", PORT], {
    cwd: ROOT,
    stdio: "ignore",
    windowsHide: true,
    env: { ...process.env },
  });
  await waitUp();
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "GV-ON",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.setUserAgent(CHROME_UA);
  await win.loadURL(URL);
});

app.on("window-all-closed", () => {
  child?.kill();
  app.quit();
});

app.on("before-quit", () => {
  child?.kill();
});
