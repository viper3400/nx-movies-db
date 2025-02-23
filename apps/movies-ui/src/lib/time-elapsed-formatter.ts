import moment from "moment";

export class TimeElapsedFormatter {
  public static duration(viewDate: Date, referenceDate: Date) {
    const startMoment = moment(viewDate);
    const endMoment = moment(referenceDate);
    const duration = moment.duration(endMoment.diff(startMoment));
    return duration;
  }

  public static durationToToday(viewDate: Date) {
    const duration = this.duration(viewDate, new Date());
    return duration;
  }

  public static getDurationString(duration: moment.Duration) {
    if (duration.years() == 0 && duration.months() < 3) {
      return `${duration.asDays().toFixed(0)}d`;
    } else if (duration.years() == 0 && duration.months() >= 3) {
      return `${duration.months()}M`;
    } else if (duration.years() > 0 && duration.months() < 2) {
      return `${duration.years()}Y`;
    } else if (duration.years() > 0 && duration.months() >= 2) {
      return `${duration.years()}Y ${duration.months()}M`;
    }
  }

  public static getDurationStringForDate(viewDate: Date) {
    const duration = this.durationToToday(viewDate);
    return this.getDurationString(duration);
  }
}
