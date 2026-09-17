import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickPlace } from "./fleet.ts";

describe("fleet route", () => {
  it("직원 12GB는 두뇌 로컬, 30B 판단은 스튜디오", () => {
    const brain = pickPlace({ seat: "staff", job: "brain", localOn: true, studioOn: false });
    assert.equal(brain.place, "local");
    const judgeOff = pickPlace({ seat: "staff", job: "harvest-judge", localOn: true, studioOn: false });
    assert.equal(judgeOff.place, "none");
    const judgeOn = pickPlace({ seat: "staff", job: "harvest-judge", localOn: true, studioOn: true });
    assert.equal(judgeOn.place, "studio");
  });
  it("비밀은 스튜디오에도 안 감", () => {
    const r = pickPlace({ seat: "staff", job: "brain", localOn: true, studioOn: true, prompt: "비밀번호 보여줘" });
    assert.equal(r.place, "none");
  });
  it("대표는 판단도 로컬", () => {
    const r = pickPlace({ seat: "owner", job: "harvest-judge", localOn: true, studioOn: false });
    assert.equal(r.place, "local");
  });
});
