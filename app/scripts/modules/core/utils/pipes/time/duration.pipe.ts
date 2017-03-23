import {Pipe, PipeTransform} from '@angular/core';
import {DurationFilter} from 'core/utils/filters/time/duration.filter';

@Pipe({name: 'deckDuration'})
export class DurationPipe implements PipeTransform {

  public transform(input: any): string {
    return DurationFilter.filter()(input);
  }
}
