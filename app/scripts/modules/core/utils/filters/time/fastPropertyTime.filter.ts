import {isString} from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';

import {TimeFilterConstants} from './timeFilters.constants';

export class FastPropertyTimeFilter {

  public static filter(): ((input: string) => string) {
    return (input: string) => {
      let result = '--';
      if (isString(input)) {
        input = input.replace('[UTC]', '').trim();
        const m: Moment = moment(input);
        result = m.isValid() ? m.format(TimeFilterConstants.DATE_AND_TIME).trim() : result;
      }

      return result;
    };
  }
}

export const FAST_PROPERTY_TIME_FILTER = 'fastPropertyTime';
