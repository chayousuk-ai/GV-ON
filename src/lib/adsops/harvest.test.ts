import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { harvestAll } from "./harvest.ts";

describe("i-boss harvest", () => {
  it("잡담은 건너뛰고 실무만 보관·갱신", () => {
    const rows = harvestAll();
    const map = Object.fromEntries(rows.map((r) => [r.post.id, r.verdict]));
    assert.equal(map.p5, "skip");
    assert.equal(map.p6, "skip");
    assert.equal(map.p3, "skip");
    assert.equal(map.p1, "keep");
    assert.equal(map.p7, "keep");
    assert.equal(map.p2, "update");
  });
});
