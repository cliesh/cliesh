import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "durationTime" })
export class DurationTimePipe implements PipeTransform {
  transform(timespan: number): string {
    const now = new Date().getTime();
    const durationMillisecond = now - timespan;
    const durationMinutes = Math.floor(durationMillisecond / 1000 / 60);

    if (durationMinutes < 1) {
      return "less then a minute";
    } else if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else if (durationMinutes < 60 * 24) {
      return `about ${Math.floor(durationMinutes / 60)} hours`;
    } else if (durationMinutes < 60 * 24 * 30) {
      return `about ${Math.floor(durationMinutes / 60 / 24)} days`;
    }
    // more than a month
    return "long long ago";
  }
}
