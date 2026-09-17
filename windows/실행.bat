@echo off
chcp 65001 >nul
set "ROOT=%LOCALAPPDATA%\GV-ON"
if exist "%~dp0..\package.json" set "ROOT=%~dp0.."
cd /d "%ROOT%"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22 가 필요합니다.
  pause
  exit /b 1
)
if not exist "node_modules" call npm install
npx --yes electron electron/main.mjs
if errorlevel 1 (
  echo Electron 창을 못 열면 콘솔만 켭니다.
  start cmd /k npm run dev
)
