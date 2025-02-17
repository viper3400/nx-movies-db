import moment from "moment";
import { TimeElapsedFormatter } from "../src/lib/time-elapsed-formatter";

describe("TimeElapsedFormatter should", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it("calculate duration between view data and reference date", () => {
    const viewDate = new Date(2025,0,1);
    const referenceDate = new Date(2025,0,31);
    const duration = TimeElapsedFormatter.duration(viewDate, referenceDate);
    expect(duration.asDays()).toBe(30);
  });

  it("returns duration for given date string", () => {
    const dateString = "2025-01-25T00:00:00.000Z";
    jest.setSystemTime(new Date(2025,0,27));
    const result = TimeElapsedFormatter.getDurationStringForDate(new Date(dateString));
    expect(result).toBe("2d");
  });

  it.each([
    [1, new Date(2025,0,1), new Date(2025,0,1), moment.duration({ years: 0, months: 0, days: 0})],
    [2, new Date(2025,0,1), new Date(2025,0,31), moment.duration({ years: 0, months: 0, days: 30})],
    [3, new Date(2025,0,1), new Date(2025,1,2), moment.duration({ years: 0, months: 1, days: 1})],
    [4, new Date(2023,0,31), new Date(2024,0,31), moment.duration({ years: 0, months: 11, days: 30})],
    [5, new Date(2023,0,31,20,20,25,222), new Date(2023,0,31), moment.duration({ years: 0, months: 0, days: 0})]
  ])("(%s) calculate duration between viewdate %s and reference date  %s", (tc, viewDate, referenceDate, expected) => {
    jest.setSystemTime(referenceDate);
    const duration = TimeElapsedFormatter.durationToToday(viewDate);
    expect(duration.years()).toBe(expected.years());
    expect(duration.months()).toBe(expected.months());
    expect(duration.days()).toBe(expected.days());
  });

  it.each([
    [moment.duration({ days: 30 }), "30d"],
    [moment.duration({ days: 90 }), "90d"],
    [moment.duration({ days: 92 }), "3M"],
    [moment.duration({ months: 1 }), "30d"],
    [moment.duration({ months: 3 }), "3M"],
    [moment.duration({ years: 1 }), "1Y"],
    [moment.duration({ years: 1, months: 1 }), "1Y"],
    [moment.duration({ years: 1, months: 2 }), "1Y 2M"],
    [moment.duration({ years: 2 }), "2Y"],
    [moment.duration({ years: 2, months: 2 }), "2Y 2M"]
  ])("format duration %s as %s", (duration, expected) => {
    const result = TimeElapsedFormatter.getDurationString(duration);
    expect(result).toBe(expected);
  });

  it.each([
    [new Date(2024,0,1), "30d"],
    [new Date(2024,0,31), "0d"],
    [new Date(2023,9,30), "3M"],
    [new Date(2023,0,31), "11M"],
  ])("format duration for view date %s to reference date 31.01.2024 as %s", (viewDate, expected) => {
    jest.setSystemTime(new Date(2024,0,31));
    const result = TimeElapsedFormatter.getDurationStringForDate(viewDate);
    expect(result).toBe(expected);
  });
});
