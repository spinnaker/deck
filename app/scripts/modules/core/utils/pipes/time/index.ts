import {PipeTransform, Type} from '@angular/core';

import {DurationPipe} from './duration.pipe';
import {FastPropertyTimePipe} from './fastPropertyTime.pipe';
import {RelativeTimePipe} from './relativeTime.pipe';
import {TimePickerTimePipe} from './timePickerTime.pipe';

export const TIME_PIPES: Type<PipeTransform>[] = [
  DurationPipe,
  FastPropertyTimePipe,
  RelativeTimePipe,
  TimePickerTimePipe
];
