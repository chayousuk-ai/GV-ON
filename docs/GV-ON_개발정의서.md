# GV-ON 개발정의서

작성: 2026-09-17  
원본: `attachments/광고업무_전용브라우저_요구사항(AI용).md`  
코드: `src/lib/adsops`, `src/lib/platform`, `src/lib/operator`, `electron/`

1부 사용환경, F2·F3·F4, S1~S10, 부록 F는 **임의 변경 금지**.

---

## 1. 제품

| 항목 | 정의 |
|---|---|
| 이름 | GV-ON (대외 표시). 네트워크 UA는 Chrome |
| 형태 | Chromium 셸 + 일과 콘솔. 엔진 자체 개발 금지 |
| 1단계 목표 | 프로필 개념 + 애널리틱스 12화면 추출 가드 + 승인 분리 |
| 현재 배포 | 일과 콘솔(웹) + `GV-ON.exe`(주소창 Chromium) |

---

## 2. 기능 F1–F8

| ID | 이름 | 필수 | 현재 |
|---|---|---|---|
| F1 | 프로필·화면 세트 | 필수 | 콘솔에 프로필·12화면 세트. 실세션 영구 유지는 Stage 2 |
| F2 | 액션 레코딩·스킬 | 필수 | 스킬 카탈로그·재생 시나리오. 실레코딩·금고 주입은 Stage 2 |
| F3 | 정형 화면 값 추출 | 필수 | 기간 가드 3자, 추출 JSON 스키마, T1–T12 테스트 |
| F4 | 사이드 패널 대조 | 필수 | 체인·경고 UI. 실서버 DB IPC는 Stage 2 |
| F5 | AI 패널 | 필수 | 봇/Hermes 방. 실 LM Studio 소켓 Stage 2 |
| F6 | 감사 로그·Qdrant | 필수 | 메모리 백 스키마. 실 Qdrant Stage 2 |
| F7 | 루틴 스케줄러 | 권장 | 봇 일정 모델(정기/반복/일시) |
| F8 | 분석·콘텐츠 보조 | 권장 | 브랜드 초안 분리, 게시 전 승인 |

### F3 기간 가드 (부록 A-1, 변경 금지)

값을 내보내려면 셋이 같아야 한다.

1. URL `startDateStr` / `endDateStr`
2. 그래프 가로축 첫·끝
3. `등락 비교일 … (N일)` 의 N = 요청 일수

조회 버튼을 안 누르면 이전 기간 — **내보내기 금지**.  
코드: `src/lib/adsops/period.ts`, 사고: `accidents.ts`.

파생: 1초 이상 체류 = 방문횟수 − 0초. 사람 암산 금지.

---

## 3. 보안 S1–S10

| ID | 원칙 | 코드 반영 |
|---|---|---|
| S1 | 자격 증명은 OS 금고만. 평문 금지 | `refuseSecret`, vault 항목명만 |
| S2 | 로컬 완결. 외부는 S7만 | 플릿도 1급이면 none |
| S3 | 읽기 자동 / 쓰기 사람 승인 | `canApprove(owner)` |
| S4 | 엑셀은 승인 도구만 | host-access excel cap |
| S5 | 없으면 null. 추정 금지 | 추출 가드 |
| S6 | GV-ONE 지정 메뉴만 | 정책 목록 |
| S7 | 외부 AI는 격리 프로필 + 문지기 | Hermes 외부 프로필 |
| S8 | 1급 차단, 2급 가명, 3급 통과 | 등급 충돌 시 높은 쪽 |
| S9 | 보안 해제 는 사람 명령만 | 3종 보고 후 대기 |
| S10 | 캡처 중 상단 배너·즉시 중단 | 콘솔 배너 규격 |

금고 이름: `GV/매체/브랜드/역할`.  
매칭: 엑셀 「3자 매칭」 시트.

---

## 4. 사람형 지각-행동 (L1–L4)

| 층 | 수단 | 언제 |
|---|---|---|
| L1 | DOM / CDP | 셀렉터 있는 웹 |
| L2 | UI Automation / a11y | 네이티브·웹 실패 시 |
| L3 | VL + Set-of-Mark | 화면만 있을 때. GPU VL |
| L4 | SendInput / CGEvent | **명시 승인 후만** |

무한 재시도 금지. 실패 시 중단·알림 (F2).

---

## 5. 사고 테스트 T1–T12 (매 빌드)

요구사항 부록 D를 `src/lib/adsops/accidents.ts` 로 고정.

대표:

- T1 날짜만 바꾸고 조회 안 누름
- T2 12화면 중 중복 캡처
- T3 기간 N일 불일치
- T4 비용 차이를 정상 지연으로 묻음 — 비용은 항상 경고
- T5 비밀값을 로그/채팅
- T6 직원 입찰 승인
- T7 엑셀 직접 기입
- T8 브랜드 섞인 초안
- T9 허용 사이트 밖 쿠키
- T10 스팸성 대량 댓글
- T11 값이 없는데 보간
- T12 캡처 중 배너 없음

`npm test`에 포함.

---

## 6. GPU · 플릿

### 대표 PC

- GPU0: Qwen 대화, BGE-M3, 리랭크. **다른 용도 금지**
- GPU1 32GB: 번역(Hy-MT급), OCR 박스, 수확 판정 30B-A3B 가능

### 직원 Titan XP 12GB

로컬: qwen3-8b, 문지기 1.7b, VL 2b, bge-m3.  
**harvest-judge 30B 불가** → 스튜디오.

### Mac Studio (나중)

Tailscale `gvon-studio`. 지식 DB ads/sales/ops/marketing.  
라우팅: `src/lib/adsops/fleet.ts` `pickPlace`.

---

## 7. 호스트 권한

`src/lib/platform/host-access.ts`

| 권한 | 기본 |
|---|---|
| 파일 | 허용 폴더만 (광고정기업무, Downloads, GV-ON 데이터) |
| 엑셀 쓰기 | 안 함. 승인 도구 호출 |
| 카카오톡·텔레그램 | 앱 실행 + 접근성. L4 승인. 내 대화만 |
| LM Studio | localhost, 이미 켜진 경우 |
| Grok/Claude/Codex | 격리 프로필 로그인. 작업용 쿠키와 섞지 않음 |
| 사이트 비밀번호 | SITE_ALLOW 만 |

Windows에서 사람이 켤 것: 접근성(UI Automation), 카톡/텔레그램 실행.

---

## 8. 크롬 가져오기

`src/lib/platform/chrome-import.ts`

| 종류 | 정책 |
|---|---|
| 북마크·방문기록 | 가져옴 |
| 로그인·쿠키 | SITE_ALLOW 만 |
| 금고 비밀번호 | 항목명만. 시크릿 덤프 금지 |

Chrome을 닫고 가져오기. Windows DPAPI는 Stage 2.

---

## 9. 오늘 일과 (목적 OS)

`src/lib/adsops/purpose.ts`

- 브랜드 칩 하나. 초안은 그 브랜드만
- 의식: 아침(12화면) / 정오(승인 비우기) / 마감(인수인계)
- 승인함: 입찰·ON/OFF·목표. 직원은 대기만
- 인수인계: 1급 문구 거부, 지식만 남김

---

## 10. 지식 수확

대상 예: i-boss 등 DB 접속 불가 사이트.  
시각적으로 메뉴 → 리스트 → 글. 기존 Qdrant와 비교 후 **새것·중요만**.  
트렌드 문서는 최신성 가중.  
직원 8B 필터, 판정은 대표 GPU1 또는 스튜디오.

---

## 11. 번역

- 텍스트: GPU1 소형 MT
- 이미지(1688 등): 글자 위 **한국어 레이어**. 이미지 재생성 금지 (웨일 방식)

---

## 12. UA · 디바이스

UA: Chrome Win64. 제품명 GV-ON을 사이트에 노출하지 않음.  
프리셋: PC / 태블릿 / 모바일 해상도.

---

## 13. 코드 지도

| 경로 | 내용 |
|---|---|
| `src/lib/adsops/period.ts` | 일·주·월, 월 시작 앵커 |
| `src/lib/adsops/accidents.ts` | T1–T12 |
| `src/lib/adsops/purpose.ts` | 브랜드·승인·의식 |
| `src/lib/adsops/fleet.ts` | 로컬/스튜디오 |
| `src/lib/adsops/gpus.ts` | GPU0/1 잡 |
| `src/lib/adsops/harvest.ts` | 선별 수집 |
| `src/lib/platform/host-access.ts` | PC 권한 |
| `src/lib/platform/chrome-import.ts` | 크롬 이전 |
| `src/lib/operator/*` | 봇, 스킬, 정책, 번역 |
| `electron/main.mjs` | GV-ON.exe 셸 |
| `electron/shell.html` | 주소창 |
| `windows/*.bat` | 설치·실행 |
| `attachments/vault_register.py` | 금고 등록 |
