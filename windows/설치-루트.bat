@echo off
chcp 65001 >nul
REM 압축 풀린 폴더 맨 위에서 더블클릭
cd /d "%~dp0"
if not exist "windows\설치.bat" (
  echo windows\설치.bat 가 없습니다. 압축을 폴더째 푸세요.
  pause
  exit /b 1
)
call "%~dp0windows\설치.bat"
