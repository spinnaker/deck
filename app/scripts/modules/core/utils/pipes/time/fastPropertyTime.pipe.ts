import {Pipe, PipeTransform} from '@angular/core';
import {FastPropertyTimeFilter} from 'core/utils/filters/time/fastPropertyTime.filter';

@Pipe({name: 'deckFastPropertyTime'})
export class FastPropertyTimePipe implements PipeTransform {

  public transform(input: string): string {
    return FastPropertyTimeFilter.filter()(input);
  }
}
