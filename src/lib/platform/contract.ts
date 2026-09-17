export type HostId = "windows" | "darwin";

export type HostAdapter = {
  id: HostId;
  label: string;
  installer: string;
  paths: { data: string; profile: string; qdrant: string; logs: string };
  input: string;
  a11y: string;
  shot: string;
  autostart: string;
  permissions: string[];
  uaDesktop: string;
  chPlatform: string;
  core: string;
};

const CHROME = "144.0.0.0";

export const HOSTS: Record<HostId, HostAdapter> = {
  windows: {
    id: "windows",
    label: "Windows 11",
    installer: "GV-ON-Setup.exe (NSIS)",
    paths: {
      data: "%APPDATA%\\GV-ON",
      profile: "%APPDATA%\\GV-ON\\chromium",
      qdrant: "%APPDATA%\\GV-ON\\qdrant",
      logs: "%APPDATA%\\GV-ON\\logs",
    },
    input: "SendInput · 절대좌표",
    a11y: "UI Automation",
    shot: "DXGI Desktop Duplication",
    autostart: "작업 스케줄러 · 게이트웨이 서비스",
    permissions: ["일반 사용자 권한", "L4에서만 입력 훅"],
    uaDesktop: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chPlatform: `"Windows"`,
    core: "playbook · Hermes · Qdrant · CDP — OS 코드 없음",
  },
  darwin: {
    id: "darwin",
    label: "macOS",
    installer: "GV-ON.dmg (notarized)",
    paths: {
      data: "~/Library/Application Support/GV-ON",
      profile: "~/Library/Application Support/GV-ON/chromium",
      qdrant: "~/Library/Application Support/GV-ON/qdrant",
      logs: "~/Library/Logs/GV-ON",
    },
    input: "CGEvent · 접근성 허용 후",
    a11y: "AX API",
    shot: "ScreenCaptureKit (화면 기록 허용)",
    autostart: "launchd · OpenClaw Gateway",
    permissions: ["손쉬운 사용", "화면 기록", "자동화"],
    uaDesktop: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chPlatform: `"macOS"`,
    core: "playbook · Hermes · Qdrant · CDP — OS 코드 없음",
  },
};

export function hostOf(id: HostId) {
  return HOSTS[id];
}
