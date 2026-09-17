# -*- coding: utf-8 -*-
"""계정 엑셀 → Windows 자격 증명 관리자 일괄 등록. 비밀값은 어떤 경로로도 출력하지 않는다.

읽는 범위(이 밖의 열·시트는 열지 않는다)
  · G-01-1) 광고_AI_블로그 업무_ID_PW.xlsx  → 시트 '계정 관리_2026.04.28' 만, A~E열만
      A 브랜드(병합·빈칸은 위 값 이어짐) B 플랫폼 C 용도 | D ID  E PW
      F열 비고, H~J열 공유계정 블록, '광고계정 PW'·'AI외 PW' 시트는 읽지 않는다.
  · G-01-1-A) 글로벌비전 블로그,SNS 계정 정보.xlsx → 시트 '블로그,sns 계정' 만, A~E열만
      A 사업부(이어짐) B 채널 | D ID  E PW      (F 비고는 읽지 않는다)

출력 원칙
  · 화면에는 항목명과 건수만. 항목명은 라벨 열(브랜드·플랫폼·용도·사업부·채널)로만 만든다.
  · 라벨이라도 자격 증명처럼 보이는 문자열(영문+숫자 혼합·특수문자·공백 없는 긴 토큰)은 항목명에서 뺀다.
  · D·E 값은 읽는 즉시 금고에 쓰고 지운다. print·log·예외 메시지에 싣지 않는다.
  · 같은 항목명이 두 개 이상이면 #2, #3 을 붙여 덮어쓰지 않는다.

사용
  python vault_register.py            계획만 출력(항목명 목록, 등록 안 함)
  python vault_register.py --apply    금고 등록 + DPAPI 백업(%LOCALAPPDATA%\GV\vault_backup.dpapi)
"""
import io
import json
import os
import re
import sys

import openpyxl

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

DOC = r"C:\Users\1902\OneDrive\Documents\A-01) 광고_정기업무"
F_AD = os.path.join(DOC, "G-01-1) 광고_AI_블로그 업무_ID_PW.xlsx")
F_SNS = os.path.join(DOC, "G-01-1-A) 글로벌비전 블로그,SNS 계정 정보.xlsx")
SHEET_AD = "계정 관리_2026.04.28"
SHEET_SNS = "블로그,sns 계정"
BACKUP_DIR = os.path.join(os.environ["LOCALAPPDATA"], "GV")
BACKUP = os.path.join(BACKUP_DIR, "vault_backup.dpapi")
APPLY = "--apply" in sys.argv
MAX_COL = 5                      # A~E 까지만. F 이후는 절대 읽지 않는다.


def clean(v):
    return " ".join(str(v).split()) if v is not None else ""


def looks_secret(s):
    """라벨 열에 섞여 들어온 아이디·비밀번호 의심 문자열 판별."""
    if not s:
        return False
    if re.search(r"[!@#$%^&*()_+=\[\]{}|\:;\"'<>?/~`]", s):
        return True
    if "@" in s or "." in s and " " not in s and re.search(r"[A-Za-z]", s):
        return True                                   # 메일·도메인형
    if re.search(r"[A-Za-z]", s) and re.search(r"\d", s) and " " not in s and len(s) >= 6:
        return True                                   # 영문+숫자 혼합 토큰
    return False


def label(v):
    s = clean(v)
    return "" if looks_secret(s) else s[:24]


def name(*parts):
    return "GV/" + "/".join(p.replace("/", "·") for p in parts if p)


def rows(path, sheet):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    if sheet not in wb.sheetnames:
        raise SystemExit("시트 없음: %s" % sheet)
    ws = wb[sheet]
    for r in ws.iter_rows(min_row=1, max_col=MAX_COL, values_only=True):
        yield (list(r) + [None] * MAX_COL)[:MAX_COL]
    wb.close()


def collect(path, sheet, prefix, start_row):
    out, carry = [], ""
    for n, (a, b, c, i, p) in enumerate(rows(path, sheet), 1):
        if n < start_row:
            continue
        if label(a):
            carry = label(a)
        i, p = clean(i), clean(p)
        if not (i and p):
            continue                                  # ID·PW 둘 다 있어야 계정 행
        if prefix:                                    # SNS: GV/SNS/사업부/채널
            t = name(prefix, carry, label(b))
        else:                                         # 광고: GV/플랫폼/브랜드/용도
            t = name(label(b), carry, label(c))
        out.append([t, i, p])
        del i, p
    return out


def dedupe(items):
    seen = {}
    for it in items:
        base = it[0]
        seen[base] = seen.get(base, 0) + 1
        if seen[base] > 1:
            it[0] = "%s#%d" % (base, seen[base])
    return items


def write_cred(target, user, secret):
    import win32cred
    win32cred.CredWrite({
        "Type": win32cred.CRED_TYPE_GENERIC,
        "TargetName": target,
        "UserName": user,
        "CredentialBlob": secret,
        "Persist": win32cred.CRED_PERSIST_LOCAL_MACHINE,
        "Comment": "GV 광고업무 금고 (vault_register.py)",
    }, 0)


def main():
    ad = collect(F_AD, SHEET_AD, "", 2)
    sns = collect(F_SNS, SHEET_SNS, "SNS", 3)
    items = dedupe(ad + sns)
    print("등록 대상 %d건 (광고 %d · SNS %d)" % (len(items), len(ad), len(sns)))
    for t, _, _ in items:
        print("  ", t)
    if not APPLY:
        print("\n(계획만 출력했습니다. 실제 등록은 --apply)")
        return

    import win32crypt
    ok = fail = 0
    backup = {}
    for t, u, s in items:
        try:
            write_cred(t, u, s)
            backup[t] = {"u": u, "p": s}
            ok += 1
        except Exception as e:                        # 값은 싣지 않는다
            fail += 1
            print("  [실패] %s : %s" % (t, type(e).__name__))
    os.makedirs(BACKUP_DIR, exist_ok=True)
    blob = win32crypt.CryptProtectData(
        json.dumps(backup, ensure_ascii=False).encode("utf-8"),
        "GV vault backup", None, None, None, 0)
    io.open(BACKUP, "wb").write(blob)
    del backup, items
    print("\n금고 등록 %d건 · 실패 %d건" % (ok, fail))
    print("DPAPI 백업: %s (이 PC·이 Windows 계정에서만 복호화 가능)" % BACKUP)


main()
