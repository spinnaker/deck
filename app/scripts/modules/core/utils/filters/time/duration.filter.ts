import * as moment from 'moment';
import {Moment} from 'moment';

import {TimeFilterConstants} from './timeFilters.constants';

export class DurationFilter {

  public static filter(): ((input: any) => string) {
    return (input: any) => {
      if (!input || isNaN(input) || input < 0) {
        return '-';
      }
      const m: Moment = moment.utc(isNaN(parseInt(input)) ? input : parseInt(input));
      const format: number | string = m.hours() ? TimeFilterConstants.HMS : TimeFilterConstants.MS;
      let dayLabel = '';
      if (m.isValid()) {
        const days = moment.duration(input, 'milliseconds').days();
        if (days > 0) {
          dayLabel = `${days}d`;
        }
      }

      return m.isValid() ? `${dayLabel}${m.format(format)}` : '-';
    };
  }
}

export const DURATION_FILTER = 'duration';
