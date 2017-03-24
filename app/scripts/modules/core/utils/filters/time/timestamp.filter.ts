import * as moment from 'moment';
import 'moment-timezone';
import {Moment} from 'moment';

import {TimeFilterConstants} from 'core/utils/filters/time/timeFilters.constants';

export class TimestampFilter {

  static get $inject(): string[] {
    return ['settings'];
  }

  public static filter(settings: any): ((input: any) => string) {
    return (input: any) => {
      const timeZone: string = settings.defaultTimeZone || 'America/Los_Angeles';
      let result: string;
      if (!input || isNaN(input) || input < 0) {
        result = '-';
      } else {
        const m: Moment = moment.tz(isNaN(parseInt(input)) ? input : parseInt(input), timeZone);
        result = m.isValid() ? m.format(TimeFilterConstants.DATE_AND_TIME) : '-';
      }

      return result;
    };
  }
}

export const TIMESTAMP_FILTER = 'timestamp';
