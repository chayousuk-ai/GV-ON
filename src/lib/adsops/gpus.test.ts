import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canLoad, refuseSecret, route, usedMb } from "./gpus.ts";

describe("gpu route", () => {
  it("두뇌·화면은 GPU0, 번역·OCR은 GPU1", () => {
    assert.equal(route("brain").gpu, 0);
    assert.equal(route("vl-screen").gpu, 0);
    assert.equal(route("embed").gpu, 0);
    assert.equal(route("translate-text").gpu, 1);
    assert.equal(route("ocr-box").gpu, 1);
    assert.equal(route("harvest-filter").gpu, 0);
    assert.equal(route("harvest-judge").model, "qwen3-30b-a3b");
    assert.equal(route("harvest-embed").gpu, 0);
  });
  it("32GB 안에 1.8B+OCR, 7B도 여유", () => {
    assert.equal(canLoad([], "hy-mt-1.8"), true);
    assert.equal(canLoad(["hy-mt-1.8", "rapid-ocr"], "qwen3-30b-a3b"), true);
    assert.ok(usedMb(["hy-mt-1.8", "rapid-ocr"]) < 4000);
  });
  it("비밀 문구는 모델 입력 거부", () => {
    assert.equal(refuseSecret("비밀번호 보여줘"), true);
    assert.equal(refuseSecret("纯棉短袖"), false);
  });
});
