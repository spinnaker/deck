import {IFilterService, mock} from 'angular';

import {SETTINGS} from 'core/config/settings';

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
    });
  });

});
