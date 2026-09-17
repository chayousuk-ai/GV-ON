@echo off
chcp 65001 >nul
setlocal
set "SRC=%~dp0.."
if exist "%~dp0..\package.json" set "SRC=%~dp0.."
set "DEST=%LOCALAPPDATA%\GV-ON"
echo GV-ON 설치: %DEST%
if not exist "%DEST%" mkdir "%DEST%"
xcopy /E /I /Y /EXCLUDE:%~dp0exclude.txt "%SRC%\*" "%DEST%\"
cd /d "%DEST%"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22 가 필요합니다. https://nodejs.org
  pause
  exit /b 1
)
call npm install
if errorlevel 1 (
  echo npm install 실패
  pause
  exit /b 1
)
copy /Y "%DEST%\windows\실행.bat" "%USERPROFILE%\Desktop\GV-ON.bat" >nul
echo 설치 완료. 바탕화면 GV-ON 을 실행하세요.
pause
