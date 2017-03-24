import {Pipe, PipeTransform} from '@angular/core';
import {RelativeTimeFilter} from 'core/utils/filters/time/relativeTime.filter';

@Pipe({name: 'deckRelativeTime'})
export class RelativeTimePipe implements PipeTransform {

  public transform(input: any): string {
    return RelativeTimeFilter.filter()(input);
  }
}
