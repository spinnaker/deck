import { SETTINGS } from 'core/config/settings';
import { IExecutionWindow } from 'core/domain';
import * as moment from 'moment';

// current time is just there for testing
export function getMinutesToNextWindow(window: IExecutionWindow, currentTime = Date.now()): number {
  const tz = SETTINGS.defaultTimeZone;
  const now = moment.tz(currentTime, tz).toObject();
  const today = moment.tz(currentTime, tz).day();
  const days = (window.days || []).slice().sort((a, b) => a - b);
  // can this even run today? if not, reset "now" to midnight
  // this is a cheat on days - we are not considering the actual days of the week
  const todayIsValid = !days.length || days.includes(today);

  const minutesToNextOpening = window.whitelist.map(w => {
    if (todayIsValid) {
      // window < 1hr and in the same hour, e.g. 12:00 to 12:45
      if (w.startHour === w.endHour && w.startMin <= now.minutes && w.endMin > now.minutes) {
        return 0;
      }
      // in the first hour of the window
      if (w.startHour !== w.endHour && w.startHour === now.hours && w.startMin <= now.minutes) {
        return 0;
      }
      // in the last hour of the window
      if (w.startHour !== w.endHour && w.endHour === now.hours && w.endMin > now.minutes) {
        return 0;
      }
      // wrapping window, e.g. 22:00 to 5:00
      if (w.startHour > w.endHour) {
        if (w.startHour < now.hours) {
          return 0;
        }
        if (w.endHour > now.hours) {
          return 0;
        }
      }
      // not a wrapping window, e.g. 9:45 to 15:00
      if (w.startHour < now.hours && w.endHour > now.hours) {
        return 0;
      }
    }
    // not in the window
    let hourOffset = 0;
    // next day?
    if (!todayIsValid || w.startHour < now.hours || (w.startHour === now.hours && w.startMin < now.minutes)) {
      if (days.length) {
        const lastDay = days[days.length - 1];
        const firstDay = days[0];
        if (lastDay <= today) {
          hourOffset = (7 - today + firstDay) * 24;
        } else {
          hourOffset = (days.find(d => d > today) - today) * 24;
        }
      } else {
        hourOffset = 24;
      }
    }
    return (hourOffset + w.startHour - now.hours) * 60 + w.startMin - now.minutes;
  });

  return Math.min(...minutesToNextOpening);
}
