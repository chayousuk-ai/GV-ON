@echo off
chcp 65001 >nul
cd /d C:\GV-ON
if not exist package.json cd /d %~dp0..
npm run desktop
