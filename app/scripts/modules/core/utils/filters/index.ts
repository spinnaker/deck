import {module} from 'angular';
import {DURATION_FILTER, DurationFilter} from 'core/utils/filters/time/duration.filter';
import {FAST_PROPERTY_TIME_FILTER, FastPropertyTimeFilter} from 'core/utils/filters/time/fastPropertyTime.filter';
import {RELATIVE_TIME_FILTER, RelativeTimeFilter} from 'core/utils/filters/time/relativeTime.filter';
import {TIMESTAMP_FILTER, TimestampFilter} from 'core/utils/filters/time/timestamp.filter';
import {TIME_PICKER_TIME_FILTER, TimePickerTimeFilter} from 'core/utils/filters/time/timePickerTime.filter';

export const TIME_FILTERS = 'spinnaker.core.utils.timeFormatters';
module(TIME_FILTERS, [require('core/config/settings.js')])
  .filter(DURATION_FILTER, DurationFilter.filter)
  .filter(FAST_PROPERTY_TIME_FILTER, FastPropertyTimeFilter.filter)
  .filter(DURATION_FILTER, DurationFilter.filter)
  .filter(RELATIVE_TIME_FILTER, RelativeTimeFilter.filter)
  .filter(TIME_PICKER_TIME_FILTER, TimePickerTimeFilter.filter)
  .filter(TIMESTAMP_FILTER, TimestampFilter.filter);
