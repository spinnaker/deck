import * as moment from 'moment';
import {IFilterService, mock} from 'angular';
import {TIME_FILTERS} from '..';
import {DurationFilter} from './duration.filter';
import {FastPropertyTimeFilter} from './fastPropertyTime.filter';
import {RelativeTimeFilter} from './relativeTime.filter';
import {TimePickerTimeFilter} from './timePickerTime.filter';
import {TimestampFilter} from './timestamp.filter';

interface ITest {
  input: number | string;
  expected?: string;
}

interface ITestData {
  [key: string]: ITest;
}

describe('Core Time Filters:', () => {

  beforeEach(mock.module(TIME_FILTERS));

  const INVALID_INPUT_VALUES: any[] = [undefined, null, -1, 'a'];
  function testValue(filter: Function, input: any, result: string): void {
    expect(filter(input)).toBe(result);
  }

  function testData(filter: Function, data: ITestData): void {
    Object.keys(data).forEach((key: string) => {
      const item: ITest = data[key];
      const actual = filter(item.input);
      expect(actual).toBe(item.expected);
    });
  }

  describe('DurationFilter:', () => {

    const durationFilter: (input?: any) => string = DurationFilter.filter();

    it('should make the duration filter accessible via the filter service', () => {
      mock.inject(($filter: IFilterService) => expect($filter('duration')).toBeDefined());
    });

    it('should return the default when invalid values are provided to the duration filter', () => {
      INVALID_INPUT_VALUES.forEach((input: any) => testValue(durationFilter, input, '-'));
    });

    it('should return the correct duration value', () => {

      const data: ITestData = {
        nineteenHours: {
          input: moment.duration(1, 'day').subtract(5, 'hours').asMilliseconds(),
          expected: '19:00:00'
        },
        oneDay: {
          input: moment.duration(1, 'day').asMilliseconds(),
          expected: '1d00:00'
        },
        oneDayThirteenHours: {
          input: moment.duration(1, 'day').add(13, 'hours').asMilliseconds(),
          expected: '1d13:00:00'
        },
        fourDaysTwentyThreeHours: {
          input: moment.duration(5, 'days').subtract(1, 'hour').asMilliseconds(),
          expected: '4d23:00:00'
        }
      };

      testData(durationFilter, data);
    });
  });

  describe('FastPropertyTimeFilter:', () => {

    const fastPropertyTimeFilter: (input?: any) => string = FastPropertyTimeFilter.filter();

    it('should make fast property time filter accessible via the filter service', () => {
      mock.inject(($filter: IFilterService) => expect($filter('fastPropertyTime')).toBeDefined());
    });

    it('should return the default when invalid values are provided to the fast property time filter', () => {
      INVALID_INPUT_VALUES.forEach((input: any) => testValue(fastPropertyTimeFilter, input, '--'));
    });

    it('should remove [UTC] and trim the string before proceeding', () => {

      const data: ITestData = {
        invalid1: {
          input: 'a [UTC]',
          expected: '--'
        },
        invalid2: {
          input: '2017-01-01 09:11:111 [UTC] ',
          expected: '--'
        },
        valid1: {
          input: '2017-02-02T10:21:22 [UTC]',
          expected: '2017-02-02 10:21:22'
        }
      };

      testData(fastPropertyTimeFilter, data);
    });

    it('should return the correct fast property time value', () => {

      const data: ITestData = {
        invalid1: {
          input: 'a',
          expected: '--'
        },
        invalid2: {
          input: '2017-01-01 09:11:111',
          expected: '--'
        },
        valid1: {
          input: '2017-02-02T10:21:22',
          expected: '2017-02-02 10:21:22'
        }
      };

      testData(fastPropertyTimeFilter, data);
    });
  });

  describe('RelativeTimeFilter:', () => {

    const relativeTimeFilter: (input?: any) => string = RelativeTimeFilter.filter();

    it('should make relative time filter accessible via the filter service', () => {
      mock.inject(($filter: IFilterService) => expect($filter('relativeTime')).toBeDefined());
    });

    it('should return the default when invalid values are provided to the relative time filter', () => {
      [null, 'a'].forEach((input: any) => testValue(relativeTimeFilter, input, '-'));
    });

    it('should return the correct relative time value', () => {

      const data: ITestData = {
        aFewSecondsAgo: {
          input: moment().subtract(10, 'seconds').valueOf(),
          expected: 'a few seconds ago'
        },
        tenMinutesAgo: {
          input: moment().subtract(10, 'minutes').valueOf(),
          expected: '10 minutes ago'
        },
        tenHoursAgo: {
          input: moment().subtract(10, 'hours').valueOf(),
          expected: '10 hours ago'
        },
        tenDaysAgo: {
          input: moment().subtract(10, 'days').valueOf(),
          expected: '10 days ago'
        }
      };

      testData(relativeTimeFilter, data);
    });
  });

  describe('TimePickerTimeFilter:', () => {

    const timePickerTime: (input?: any) => string = TimePickerTimeFilter.filter();

    it('should make time picker time filter accessible via the filter service', () => {
      mock.inject(($filter: IFilterService) => expect($filter('timePickerTime')).toBeDefined());
    });

    it('should return the default when invalid values are provided to the time picker time filter', () => {
      [...INVALID_INPUT_VALUES, [], {}, {foo: 'bar'}, {hours: 'hours', minutes: 17}, {hours: 5, minutes: 'minutes'}]
        .forEach((input: any) => testValue(timePickerTime, input, '-'));
    });

    it('should return the correct time picker time value for string inputs', () => {
      expect(timePickerTime({hours: '10', minutes: '30'})).toBe('10:30');
      expect(timePickerTime({hours: '10', minutes: 30})).toBe('10:30');
      expect(timePickerTime({hours: 10, minutes: '30'})).toBe('10:30');
    });

    it('should add leading zeros to the hours and minutes when appropriate', () => {
      expect(timePickerTime({hours: 1, minutes: 30})).toBe('01:30');
      expect(timePickerTime({hours: 10, minutes: 5})).toBe('10:05');
    });
  });

  describe('TimestampFilter:', () => {

    let timestampFilter: (input?: any) => string;
    beforeEach(mock.inject((settings: any) => {
      settings.defaultTimeZone = 'Etc/GMT+0';
      timestampFilter = TimestampFilter.filter(settings);
    }));

    it('should make relative time filter accessible via the filter service', () => {
      mock.inject(($filter: IFilterService) => expect($filter('timestamp')).toBeDefined());
    });

    it('should return the default when invalid values are provided to the timestamp filter', () => {
      INVALID_INPUT_VALUES.forEach((input: any) => testValue(timestampFilter, input, '-'));
    });

    it('should return the correct, formatted timestamp value when valid', () => {
      expect(timestampFilter(1445707299020)).toBe('2015-10-24 17:21:39 GMT');
    });
  });
});
