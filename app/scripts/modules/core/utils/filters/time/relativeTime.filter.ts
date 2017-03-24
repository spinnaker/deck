import * as moment from 'moment';
import {Moment} from 'moment';

export class RelativeTimeFilter {

  public static filter(): ((input: any) => string) {
    return (input: any) => {
      const m: Moment = moment(isNaN(parseInt(input)) ? input : parseInt(input));
      return m.isValid() ? m.fromNow() : '-';
    };
  }
}

export const RELATIVE_TIME_FILTER = 'relativeTime';
