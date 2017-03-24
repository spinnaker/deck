import {TimeFilterConstants} from 'core/utils/filters/time/timeFilters.constants';
import * as moment from 'moment';

export class TimePickerTimeFilter {

  public static filter(): ((input: any) => string) {
    return (input: any) => {

      let result = '-';
      if (input && !isNaN(input.hours) && !isNaN(input.minutes)) {
        const hours = parseInt(input.hours);
        const minutes = parseInt(input.minutes);
        result = moment().hours(hours).minutes(minutes).format(TimeFilterConstants.HM);
      }

      return result;
    };
  }
}

export const TIME_PICKER_TIME_FILTER = 'timePickerTime';
