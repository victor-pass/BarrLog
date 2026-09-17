import { describe, it, expect, test } from "vitest";
import { TimeAPI } from "./TimeAPI";

describe("dayTimeRange", () => {
  it("should return the start and end of day for the timezone", () => {
    const result = new TimeAPI(
      "America/Denver",
      () => "2020-01-01T01:00",
    ).dayTimeRange("2020-01-01");

    expect(result).toEqual({
      from: "2020-01-01T00:00:00-07:00",
      to: "2020-01-02T00:00:00-07:00",
    });
  });
});

describe("dateTime", () => {
  it("should create a datetime string in the timezone and date", () => {
    const result = new TimeAPI(
      "America/Denver",
      () => "2020-01-01T01:00",
    ).dateTime("13:00");
    expect(result).toEqual("2020-01-01T13:00:00-07:00");
  });
});

describe("localInputTime", () => {
  it("should extract a <input type=time> value from an iso DateTime", () => {
    const result = new TimeAPI(
      "America/Denver",
      () => "2020-01-01T01:00",
    ).localInputTime("2026-09-17T16:30:38.434Z");
    expect(result).toEqual("10:30");
  });
});
