import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canApp, canFile, canLogin } from "./host-access.ts";

describe("host access", () => {
  it("허용 사이트만 로그인", () => {
    assert.equal(canLogin("ads.naver.com", true).ok, true);
    assert.equal(canLogin("bank.example", true).ok, false);
    assert.equal(canLogin("ads.naver.com", false).ok, false);
  });
  it("엑셀 직접 쓰기 금지, 광고 폴더 읽기 허용", () => {
    assert.equal(canFile("Documents/A-01) 광고_정기업무/a.txt", false, true).ok, true);
    assert.equal(canFile("Documents/A-01) 광고_정기업무/실적.xlsx", true, true).ok, false);
    assert.equal(canFile("C:/Windows/System32/config", false, true).ok, false);
  });
  it("메신저는 L4 없이 거부", () => {
    assert.equal(canApp("kakaotalk", true, false).ok, false);
    assert.equal(canApp("kakaotalk", true, true).ok, true);
  });
});
