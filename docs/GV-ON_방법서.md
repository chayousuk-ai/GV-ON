# GV-ON 방법서

작성: 2026-09-17  
이 문서는 **어떻게 만들었고, 다음에 어떻게 이어가는지**다.  
무엇을 만드는지는 정의서, 왜인지는 참고자료.

---

## 1. 작업 환경

| 구간 | 방법 |
|---|---|
| 2026-09 대화 | Grok Build 샌드박스. 미리보기 웹 콘솔 |
| 이후 | Windows 11 · Node 24 · Grok CLI · `C:\GV-ON` |
| 소스·exe | GitHub `chayousuk-ai/GV-ON` |

Node **24.19.0이면 된다. 22를 추가 설치하지 않는다.**

---

## 2. 받아서 실행

### 실행파일 (브라우저 창)

1. [GV-ON-Windows.zip](https://github.com/chayousuk-ai/GV-ON/releases/download/v0.1.0/GV-ON-Windows.zip) 저장
2. 압축 해제
3. `GV-ON.exe` 또는 `설치-C드라이브.bat` → `C:\GV-ON\GV-ON.exe`
4. 주소창 Chromium. 사이트에는 Chrome으로 보임

폴더 전체를 유지한다. exe만 복사하면 DLL이 없어 안 뜬다.

### 소스

```
cd /d C:\
git clone https://github.com/chayousuk-ai/GV-ON.git GV-ON
cd /d C:\GV-ON
npm install
npm run desktop
```

이미 폴더가 있으면 그 안에서 `git remote` 후 `git pull`.

Grok CLI 작업 폴더: **`C:\GV-ON`**.

---

## 3. 이 턴에서 쓴 방법

1. 요구사항 MD를 단일 기준으로 읽음
2. 웹 일과 콘솔을 TanStack+React로 구현 (미리보기 가능)
3. 가드·사고·플릿·비밀거부는 **순수 함수 + node:test** 로 고정
4. 실 Chromium 로그인은 이 샌드박스에서 불가 → 콘솔로 규격만
5. 채팅 다운로드가 막혀 **GitHub 공개 저장소 + Release 자산**
6. Linux에서 `electron-packager --platform=win32` 로 `GV-ON.exe` 생성

바꾸지 않은 것: 기간 가드 3자, 금고 항목명, S3/S4, 브랜드 분리.

---

## 4. 테스트

```
npm test
npm run typecheck
```

포함: period, accidents, gpus, harvest, host-access, fleet, purpose, chrome-import.

새 가드를 넣으면 **사고 테스트 한 줄**을 같이 넣는다.

---

## 5. GPU 라우팅 실무

대표 PC:

- GPU0 이미 Qwen·임베딩이면 **그대로**. 번역을 GPU0에 올리지 않음
- GPU1 32GB: Hy-MT 등 소형 번역, 필요 시 판정 모델
- LM Studio는 localhost만. 브라우저가 모델을 다운로드하지 않음

직원:

- Titan XP에는 8B+VL+BGE만
- 없으면 Tailscale 스튜디오 (아직 연결 안 함). 코드는 `pickPlace`만 준비

1급 문자열은 모델·스튜디오 **둘 다 안 감**.

---

## 6. 금고 (담당자 PC)

1. 인벤토리·매칭표 확인 (비밀값 없음)
2. `vault_register.py` 는 **담당자만**, 실비밀번호 입력 시
3. 브라우저는 항목명 `GV/매체/브랜드/역할` 로만 조회
4. 로그·채팅·Qdrant·스크린샷에 비밀번호 금지

코드에 비밀번호를 적지 않는다. AI가 물어봐도 답에 넣지 않는다.

---

## 7. Stage 2 (Grok CLI에서)

순서. 각 단계는 단독으로 쓸 수 있게.

1. Electron 창에서 탭 + Playwright/CDP (허용 사이트)
2. 네이버 애널리틱스 12화면: 기간 입력 → 조회 클릭 → 3자 가드 → JSON
3. Windows Credential Manager 읽기 (항목명만 화면에 표시)
4. Qdrant `127.0.0.1` 적재 (추출·스킬 메타)
5. LM Studio 호출. GPU0/1 잡 테이블 준수
6. 크롬 Login DB DPAPI (Chrome 종료 후, SITE_ALLOW)
7. electron-builder NSIS `GV-ON-Setup.exe`
8. macOS 패키지 (같은 `electron/main.mjs`)

막히면 30분 단위로: 무엇이 막혔는지, 선택지 둘, 장단점. 비개발자 말로.

---

## 8. 윈도우에서 사람이 켤 설정

| 항목 | 이유 |
|---|---|
| Node 24 | 소스 실행·npm |
| Git | clone |
| 접근성 → UI Automation에 GV-ON | L2 |
| 카카오톡·텔레그램 실행 | 메신저 자동화 시 |
| Chrome 종료 후 가져오기 | 파일 잠금 |
| LM Studio·Qdrant 이미 설치분 | 새로 깔지 말고 localhost |

관리자 권한으로 브라우저를 상시 실행하지 않는다. L4는 승인 후.

---

## 9. 스팸·차단

사람처럼: 간격, 탭 전환, 조회 위주.  
대량 동일 댓글·가입 직후 도배 스킬은 거부.  
UA는 흔한 Chrome. GV-ON 문자열을 Client Hints에 넣지 않음.

---

## 10. 산출물 위치

| 산출 | 위치 |
|---|---|
| 참고자료 | `docs/GV-ON_개발참고자료.md` `.docx` |
| 정의서 | `docs/GV-ON_개발정의서.md` `.docx` |
| 방법서 | `docs/GV-ON_방법서.md` `.docx` |
| 요구 원본 | `attachments/` |
| exe | GitHub Release v0.1.0 |
| 소스 | GitHub main |
