import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planImport, SCAN, takeRow } from "./chrome-import.ts";

describe("chrome import", () => {
  it("크롬이 켜져 있으면 전부 거부", () => {
    const r = planImport(SCAN, { closed: false, grant: true });
    assert.equal(r.ok.length, 0);
  });
  it("은행 로그인은 건너뛰고 광고 로그인은 금고만", () => {
    const bank = takeRow(SCAN.find((s) => s.host === "bank.example")!, { closed: true, grant: true });
    assert.equal(bank.ok, false);
    const ads = takeRow(SCAN.find((s) => s.kind === "login" && s.host === "ads.naver.com")!, { closed: true, grant: true });
    assert.equal(ads.ok, true);
    assert.match(ads.why, /금고/);
  });
  it("유튜브 즐겨찾기는 되고 쿠키는 안 됨", () => {
    const bm = takeRow({ kind: "bookmark", host: "www.youtube.com", title: "YouTube" }, { closed: true, grant: true });
    const ck = takeRow({ kind: "cookie", host: "www.youtube.com", title: "세션" }, { closed: true, grant: true });
    assert.equal(bm.ok, true);
    assert.equal(ck.ok, false);
  });
});
