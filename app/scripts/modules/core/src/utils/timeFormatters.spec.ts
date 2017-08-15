import { IFilterService, mock } from 'angular';

import { SETTINGS } from 'core/config/settings';
import { duration } from './timeFormatters';

describe('Filter: timeFormatters', function() {
  beforeEach(function () {
    SETTINGS.defaultTimeZone = 'Etc/GMT+0';
  });

  beforeEach(
    mock.module('spinnaker.core.utils.timeFormatters')
  );

  afterEach(SETTINGS.resetToOriginal);

  describe('timePickerTime', function() {

    let filter: (input?: any) => any;

    describe('timePicker', function () {
      beforeEach(
        mock.inject(
          function($filter: IFilterService) {
            filter = $filter('timePickerTime') as any;
          }
        )
      );
      it('returns nothing when invalid values are provided', function() {
        expect(filter()).toBe('-');
        expect(filter({})).toBe('-');
        expect(filter({invalidField: 2})).toBe('-');
        expect(filter({h: 2})).toBe('-');
        expect(filter({h: 2, m: 1})).toBe('-');
        expect(filter({hours: 2, m: 1})).toBe('-');
        expect(filter({h: 2, minutes: 1})).toBe('-');
        expect(filter({hours: 'pasta', minutes: 1})).toBe('-');
        expect(filter({hours: 11, minutes: 'copy'})).toBe('-');
      });

      it('handles string inputs', function() {
        expect(filter({hours: '10', minutes: '30'})).toBe('10:30');
        expect(filter({hours: '10', minutes: 30})).toBe('10:30');
        expect(filter({hours: 10, minutes: '30'})).toBe('10:30');
      });

      it('prefixes hours, minutes with zeros if necessary', function() {
        expect(filter({hours: 1, minutes: 30})).toBe('01:30');
        expect(filter({hours: 10, minutes: 5})).toBe('10:05');

      });
    });

    describe('timestamp', function () {
      beforeEach(
        mock.inject(
          function($filter: IFilterService) {
            filter = $filter('timestamp') as any;
          }
        )
      );
      it('returns nothing when invalid values are provided', function() {
        expect(filter()).toBe('-');
        expect(filter(null)).toBe('-');
        expect(filter(-1)).toBe('-');
        expect(filter('a')).toBe('-');
      });
      it('returns formatted date when valid value is provided', function () {
        expect(filter(1445707299020)).toBe('2015-10-24 17:21:39 GMT');
      });
    });

    describe('duration', function () {
      beforeEach(
        mock.inject(
          function($filter: IFilterService) {
            filter = $filter('duration') as any;
          }
        )
      );

      it('returns nothing when invalid values are provided', function () {
        expect(filter()).toBe('-');
        expect(filter(null)).toBe('-');
        expect(filter(-1)).toBe('-');
        expect(filter('a')).toBe('-');
      });

      it('formats durations in ms (less than an hour) as MM:SS', function () {
        expect(duration(1000)).toBe('00:01');
        expect(duration(10000)).toBe('00:10');
        expect(duration(60000)).toBe('01:00');
        expect(duration(60000 * 59)).toBe('59:00');
      });

      it('formats durations in ms (more than an hour) as HH:MM:SS', function () {
        expect(duration(60000 * 60)).toBe('01:00:00');
        expect(duration(60000 * 60 * 10)).toBe('10:00:00');
        expect(duration(60000 * 60 * 23)).toBe('23:00:00');
      });

      it('formats durations in ms (more than an day) as D"d"HH:MM:SS', function () {
        expect(duration(60000 * 60 * 24)).toBe('1d00:00:00');
        expect(duration((60000 * 60 * 24 * 20))).toBe('20d00:00:00');
      });

      it('accurately formats number of days 31 days or higher', function () {
        expect(duration((60000 * 60 * 24 * 65))).toBe('65d00:00:00');
        expect(duration((60000 * 60 * 24 * 9999))).toBe('9999d00:00:00');
      });
    });
  });

});
