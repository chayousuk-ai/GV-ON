# 윈도우 CMD + Grok CLI 이어서 작업

이 폴더가 GV-ON 소스 전체입니다.

## 열기

```
cd %LOCALAPPDATA%\GV-ON
```

압축만 풀었으면 그 폴더로 들어갑니다. Grok CLI에 **이 폴더**를 프로젝트로 줍니다.

## 실행

```
npm install
npm run desktop
```

또는 `windows\실행.bat`. 사이트에는 Chrome으로 보입니다.

## 바꾸지 말 것

- 금고 항목명 `GV/매체/브랜드/역할` — 비밀번호를 코드·로그에 넣지 않음
- 기간 가드 3자 (URL · 축 · N일)
- 조회 자동 / 입찰·ON/OFF·결제는 사람 승인 (S3)
- 엑셀은 승인 도구만 (S4)
- 허용 사이트 밖 로그인·쿠키 가져오기 금지

## 다음 할 일 (실제 브라우저)

1. Electron 창에서 광고 사이트 탭 (Playwright/CDP)
2. Windows 자격 증명 금고 연결 (`attachments/vault_register.py`)
3. Qdrant · LM Studio(GPU0/1) localhost
4. NSIS `GV-ON-Setup.exe` (electron-builder --win)

## 설치

같은 압축의 `설치.bat`(맨 위) 또는 `windows\설치.bat`.
