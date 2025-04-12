import moment from "moment";

export class TimeElapsedFormatter {
  public static duration(viewDate: Date, referenceDate: Date) {
    const startMoment = moment(viewDate);
    const endMoment = moment(referenceDate);
    const duration = moment.duration(endMoment.diff(startMoment));
    console.log(duration);
    return duration;
  }

  public static durationToToday(viewDate: Date) {
    const duration = this.duration(viewDate, new Date());
    return duration;
  }

  public static getDurationString(duration: moment.Duration) {
    if (duration.asSeconds() < 86400) {
      return "0d";
    } else if (duration.asMonths() < 3) {
      return `${Math.floor(duration.asDays())}d`;
    } else if (duration.asYears() < 1) {
      return `${Math.floor(duration.asMonths())}M`;
    } else {
      const years = Math.floor(duration.asYears());
      const months = Math.floor(duration.asMonths() % 12);
      return months > 0 ? `${years}Y ${months}M` : `${years}Y`;
    }
  }

  public static getDurationStringForDate(viewDate: Date) {
    const duration = this.durationToToday(viewDate);
    return this.getDurationString(duration);
  }

  public static getDurationStringForDateArray(viewDates: Date[]) {
    viewDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestDate = viewDates[0];
    return this.getDurationStringForDate(latestDate);
  }
}
