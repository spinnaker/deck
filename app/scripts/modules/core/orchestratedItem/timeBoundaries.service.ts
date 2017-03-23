import {isUndefined} from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {module} from 'angular';

interface IBoundary {
  readonly name: string;
  moment: () => Moment;
}

export interface IHasStartTime {
  startTime: any;
}

export interface IGroupByTimeBoundryResult {
  [key: string]: IHasStartTime[];
}

export class TimeBoundaries {

  private static BOUNDARIES: IBoundary[] = [
    {name: 'Today', moment: () => moment()},
    {name: 'Yesterday', moment: () => moment().startOf('day')},
    {name: 'This Week', moment: () => moment().startOf('week')},
    {name: 'Last Week', moment: () => moment().startOf('week').subtract(1, 'week')},
    {name: 'Last Month', moment: () => moment().startOf('month')},
    {name: 'Prior Years', moment: () => moment().startOf('year')}
  ];

  private isBetween(item: IHasStartTime, startBoundary: IBoundary, endBoundary: IBoundary): boolean {

    let result = false;
    if (!isUndefined(startBoundary)) {
      const timeStamp: Moment = moment(item.startTime);
      const startIndex: number = TimeBoundaries.BOUNDARIES.indexOf(startBoundary);
      const between: boolean =
        timeStamp.isBefore(startBoundary.moment()) &&
        (isUndefined(endBoundary) || timeStamp.isAfter(endBoundary.moment()) || timeStamp.isSame(endBoundary.moment()));
      const exclusive: boolean =
        TimeBoundaries.BOUNDARIES.every((boundary: IBoundary, i: number) => {
          const next: IBoundary = TimeBoundaries.BOUNDARIES[i + 1];
          return (i >= startIndex) || !(timeStamp.isBefore(boundary.moment()) &&
            (timeStamp.isAfter(next.moment()) || timeStamp.isSame(next.moment())));
        });
      result = between && exclusive;
    }

    return result;
  }

  public groupByTimeBoundary(items: IHasStartTime[]): IGroupByTimeBoundryResult {
    const result: IGroupByTimeBoundryResult = {};
    TimeBoundaries.BOUNDARIES.reduce((current: IBoundary, next: IBoundary) => {
      const filtered: IHasStartTime[] = items.filter((item: IHasStartTime) => this.isBetween(item, current, next));
      if (filtered.length > 0) {
        result[current.name] = filtered;
      }

      return next;
    });

    return result;
  }
}

export const TIME_BOUNDARIES_SERVICE = 'spinnaker.timeBoundaries.service';
module(TIME_BOUNDARIES_SERVICE, [])
  .service('timeBoundaries', TimeBoundaries);
