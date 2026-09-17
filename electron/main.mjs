import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

app.userAgentFallback = CHROME_UA;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "GV-ON",
    autoHideMenuBar: true,
    webPreferences: {
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setUserAgent(CHROME_UA);
  void win.loadFile(path.join(ROOT, "electron", "shell.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
