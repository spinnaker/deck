import {Pipe, PipeTransform} from '@angular/core';
import {TimePickerTimeFilter} from 'core/utils/filters/time/timePickerTime.filter';

@Pipe({name: 'deckTimePickerTime'})
export class TimePickerTimePipe implements PipeTransform {

  public transform(input: any): string {
    return TimePickerTimeFilter.filter()(input);
  }
}
