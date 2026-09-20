import { test } from "node:test";
import assert from "node:assert/strict";
import { TIME_REGEX, timeToMinutes, minutesToTime } from "./time.js";

test("timeToMinutes e minutesToTime são inversas", () => {
    assert.equal(timeToMinutes("00:00"), 0);
    assert.equal(timeToMinutes("09:30"), 570);
    assert.equal(timeToMinutes("23:59"), 1439);
    assert.equal(minutesToTime(570), "09:30");
    assert.equal(minutesToTime(0), "00:00");
});

test("TIME_REGEX aceita só HH:mm válido", () => {
    for (const ok of ["00:00", "09:05", "23:59"]) assert.ok(TIME_REGEX.test(ok), ok);
    for (const bad of ["24:00", "9:30", "12:60", "12:5", "12-30", ""]) assert.ok(!TIME_REGEX.test(bad), bad);
});
