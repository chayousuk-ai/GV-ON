import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allPeriods, dayRange, lastBusinessDay, monthRange, weekRange } from "./period.ts";

describe("period B-3", () => {
  it("월요일의 기준일은 금요일", () => {
    assert.equal(lastBusinessDay(new Date(2026, 8, 14)), "2026-09-11");
  });
  it("9월 16일 일·주·월", () => {
    const base = "2026-09-16";
    assert.deepEqual(dayRange(base), { since: base, until: base, label: "일간", days: 1 });
    const w = weekRange(base);
    assert.equal(w.since, "2026-09-11");
    assert.equal(w.until, base);
    const m = monthRange(base);
    assert.equal(m.since, "2026-08-28");
    assert.equal(m.until, base);
    assert.equal(allPeriods(base).length, 3);
  });
});
