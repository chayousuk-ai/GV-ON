import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCIDENTS, runAccidents } from "./accidents.ts";

describe("부록 D T1–T12", () => {
  it("12건 전부 통과", () => {
    assert.equal(ACCIDENTS.length, 12);
    const rows = runAccidents();
    const fail = rows.filter((r) => !r.ok);
    assert.equal(fail.length, 0, fail.map((f) => f.id).join(","));
  });
});
