import moment from "moment";

export class TimeElapsedFormatter {
  public static duration(startDate: Date, endDate: Date) {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const duration = moment.duration(endMoment.diff(startMoment));
    const durationPlusOne = duration.add(1, 'days');
    return durationPlusOne;
  }

  public static durationToToday(startDate: Date) {
    const duration = this.duration(startDate, new Date());
    return duration;
  }

  public static getDurationString(duration: moment.Duration) {
    if(duration.years() == 0 && duration.months() < 3) {
      return `${duration.asDays()}d`;
    }
    else if(duration.years() == 0 && duration.months() >= 3) {
      return `${duration.months()}M`;
    }
    else if(duration.years() > 0 && duration.months() < 2) {
      return `${duration.years()}Y`;
    }
    else if(duration.years() > 0 && duration.months() >= 2) {
      return `${duration.years()}Y ${duration.months()}M`;
    }
  }

  public static getDurationStringForDate(date: Date) {
    const duration = this.durationToToday(date);
    return this.getDurationString(duration);
  }
}
