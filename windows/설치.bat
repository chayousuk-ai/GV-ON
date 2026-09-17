@echo off
chcp 65001 >nul
cd /d C:\
if exist GV-ON\package.json (
  cd GV-ON
  git pull
) else (
  git clone https://github.com/chayousuk-ai/GV-ON.git GV-ON
  cd GV-ON
)
call npm install
echo 설치 완료. C:\GV-ON
pause
