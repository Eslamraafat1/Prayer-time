import { test } from "node:test";
import assert from "node:assert/strict";
import { getNextPrayer, formatCountdown } from "../src/lib/nextPrayer.ts";

const timings = { fajr: "04:43", dhuhr: "11:39", asr: "14:44", maghrib: "17:06", isha: "18:25" };
const at = (h: number, m: number, s = 0) => new Date(2026, 10, 4, h, m, s);

test("before Fajr (after midnight) counts down to today's Fajr", () => {
  assert.deepEqual(getNextPrayer(timings, at(2, 0)), { index: 0, remainingMs: (2 * 60 + 43) * 60_000 });
});

test("between Fajr and Dhuhr counts down to Dhuhr", () => {
  assert.deepEqual(getNextPrayer(timings, at(10, 39)), { index: 1, remainingMs: 60 * 60_000 });
});

test("between Maghrib and Isha counts down to Isha", () => {
  assert.equal(getNextPrayer(timings, at(18, 0)).index, 4);
});

test("exactly at a prayer time moves on to the next prayer", () => {
  assert.equal(getNextPrayer(timings, at(14, 44)).index, 3);
});

test("after Isha counts down to the next day's Fajr", () => {
  const { index, remainingMs } = getNextPrayer(timings, at(20, 0));
  assert.equal(index, 0);
  // 20:00 -> 24:00 is 4h, plus 4h43m to Fajr = 8h43m
  assert.equal(remainingMs, (8 * 60 + 43) * 60_000);
  assert.equal(formatCountdown(remainingMs), "08:43:00");
});

test("just before midnight still counts to tomorrow's Fajr", () => {
  const { index, remainingMs } = getNextPrayer(timings, at(23, 59, 30));
  assert.equal(index, 0);
  assert.equal(formatCountdown(remainingMs), "04:43:30");
});

test("accepts Aladhan times with a timezone suffix", () => {
  assert.equal(getNextPrayer({ ...timings, dhuhr: "11:39 (EET)" }, at(10, 39)).remainingMs, 60 * 60_000);
});

test("formatCountdown pads hours, minutes and seconds", () => {
  assert.equal(formatCountdown(3_723_000), "01:02:03");
  assert.equal(formatCountdown(-5), "00:00:00");
});
