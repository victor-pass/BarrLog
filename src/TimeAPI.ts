import { Accessor } from "solid-js";
import "temporal-polyfill/global";
import "temporal-polyfill/types/global";

export class TimeAPI {
  date: Accessor<string>;
  zone: string;

  constructor(zone: string, date: Accessor<string>) {
    this.zone = zone;
    this.date = date;
  }

  dayTimeRange(date: string) {
    const from = Temporal.PlainDate.from(date).toZonedDateTime({
      timeZone: this.zone,
    });
    return {
      from: from.toString({ timeZoneName: "never" }),
      to: from.add({ days: 1 }).toString({ timeZoneName: "never" }),
    };
  }

  dateTime(time: string) {
    return Temporal.PlainDate.from(this.date())
      .toZonedDateTime({
        plainTime: time,
        timeZone: this.zone,
      })
      .toString({ timeZoneName: "never" });
  }

  localInputTime(dateTime: string) {
    return Temporal.Instant.from(dateTime)
      .toZonedDateTimeISO(this.zone)
      .toPlainTime()
      .toString({
        smallestUnit: "minute",
      });
  }
  displayDateTime(time: string) {
    return new Date(time)
      .toTemporalInstant()
      .toZonedDateTimeISO(this.zone)
      .toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
      });
  }

  today() {
    return Temporal.Now.plainDateISO(this.zone).toString();
  }
  defaultTime() {
    return Temporal.Now.plainTimeISO(this.zone).toString({
      smallestUnit: "minute",
    });
  }
}
