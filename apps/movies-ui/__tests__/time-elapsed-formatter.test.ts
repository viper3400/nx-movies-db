import moment from "moment";
import { TimeElapsedFormatter } from "../src/lib/time-elapsed-formatter";

describe("TimeElapsedFormatter should", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it("calculate duration between start and end date", () => {
    const startDate = new Date(2025,0,1);
    const endDate = new Date(2025,0,31);
    const duration = TimeElapsedFormatter.duration(startDate, endDate);
    expect(duration.asDays()).toBe(31);
  });

  it.each([
    [new Date(2025,0,1), new Date(2025,0,1), moment.duration({ years: 0, months: 0, days: 1})],
    [new Date(2025,0,1), new Date(2025,0,31), moment.duration({ years: 0, months: 1, days: 0})],
    [new Date(2025,0,1), new Date(2025,1,2), moment.duration({ years: 0, months: 1, days: 2})],
    [new Date(2023,0,31), new Date(2024,0,31), moment.duration({ years: 1, months: 0, days: 0})]
  ])("calculate duration between %s and %s", (startDate, endDate, expected) => {
    jest.setSystemTime(endDate);
    const duration = TimeElapsedFormatter.durationToToday(startDate);
    expect(duration.days()).toBe(expected.days());
    expect(duration.months()).toBe(expected.months());
    expect(duration.years()).toBe(expected.years());
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
    [new Date(2024,0,1), "31d"],
    [new Date(2024,0,31), "1d"],
    [new Date(2023,9,30), "3M"],
    [new Date(2023,0,31), "1Y"],
  ])("format duration for date %s as %s", (date, expected) => {
    jest.setSystemTime(new Date(2024,0,31));
    const result = TimeElapsedFormatter.getDurationStringForDate(date);
    expect(result).toBe(expected);
  });
});
