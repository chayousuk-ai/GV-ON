import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canApprove, decideApproval, handoffSafe, isolateDraft, ritualProgress, SEED_APPROVALS } from "./purpose.ts";

describe("purpose desk", () => {
  it("돈 움직이는 승인은 대표만", () => {
    assert.equal(canApprove("staff"), false);
    const a = decideApproval(SEED_APPROVALS[0], "staff", true);
    assert.equal(a.status, "wait");
    assert.equal(decideApproval(SEED_APPROVALS[0], "owner", true).status, "ok");
  });
  it("초안은 같은 브랜드만, 비밀은 차단", () => {
    assert.equal(isolateDraft("sun", "gp", "키워드 초안").ok, false);
    assert.equal(isolateDraft("sun", "sun", "키워드 초안").ok, true);
    assert.equal(isolateDraft("sun", "sun", "비밀번호 넣기").ok, false);
    assert.equal(handoffSafe("비밀번호 전달").ok, false);
    assert.equal(handoffSafe("12화면 완료 · 카카오 남음").ok, true);
  });
  it("아침은 12화면 채워야 끝", () => {
    assert.equal(ritualProgress("morning", { extracts: 3, approvalsWait: 2, handoff: false }).done, false);
    assert.equal(ritualProgress("morning", { extracts: 12, approvalsWait: 2, handoff: false }).done, true);
  });
});
