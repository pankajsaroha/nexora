import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateProRataDays } from "../service";

describe("Leave Policy Engine - Pro-Rata & Calculation Logic", () => {
  const leaveYearStart = new Date("2026-01-01");
  const leaveYearEnd = new Date("2026-12-31");

  it("Full year employee gets full annual entitlement", () => {
    const fullYearDays = calculateProRataDays({
      annualEntitlement: 12,
      proRataEnabled: true,
      roundingRule: "NEAREST_HALF",
      joiningDate: new Date("2025-06-01"), // joined prior to leave year
      leaveYearStart,
      leaveYearEnd,
    });

    assert.equal(fullYearDays, 12);
  });

  it("Mid-year joiner (July 1st) gets 50% pro-rata entitlement with rounding", () => {
    const midYearDays = calculateProRataDays({
      annualEntitlement: 12,
      proRataEnabled: true,
      roundingRule: "NEAREST_HALF",
      joiningDate: new Date("2026-07-01"), // exactly half year
      leaveYearStart,
      leaveYearEnd,
    });

    assert.equal(midYearDays, 6);
  });

  it("Rounding rule: FLOOR vs CEILING vs NEAREST_HALF", () => {
    // 10 days annual entitlement, joined 100 days remaining out of 365 => 10 * (100/365) = 2.7397
    const remainingDaysJoining = new Date(leaveYearEnd.getTime() - 100 * 24 * 60 * 60 * 1000);

    const floorVal = calculateProRataDays({
      annualEntitlement: 10,
      proRataEnabled: true,
      roundingRule: "FLOOR",
      joiningDate: remainingDaysJoining,
      leaveYearStart,
      leaveYearEnd,
    });
    assert.equal(floorVal, 2);

    const ceilVal = calculateProRataDays({
      annualEntitlement: 10,
      proRataEnabled: true,
      roundingRule: "CEILING",
      joiningDate: remainingDaysJoining,
      leaveYearStart,
      leaveYearEnd,
    });
    assert.equal(ceilVal, 3);

    const halfVal = calculateProRataDays({
      annualEntitlement: 10,
      proRataEnabled: true,
      roundingRule: "NEAREST_HALF",
      joiningDate: remainingDaysJoining,
      leaveYearStart,
      leaveYearEnd,
    });
    assert.equal(halfVal, 2.5);
  });

  it("Pro-rata disabled returns full annual entitlement regardless of join date", () => {
    const calculated = calculateProRataDays({
      annualEntitlement: 12,
      proRataEnabled: false,
      roundingRule: "NEAREST_HALF",
      joiningDate: new Date("2026-09-01"),
      leaveYearStart,
      leaveYearEnd,
    });

    assert.equal(calculated, 12);
  });
});
