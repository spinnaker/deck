import { SETTINGS } from 'core/config/settings';
import { ITimeWindow } from 'core/domain';
import { getMinutesToNextWindow } from './executionWindowUtils';

// Tue Feb 13 2018 12:000 GMT
const now = 1518523200000;

describe('getMinutesToNextWindow', () => {

  let whitelist: ITimeWindow[];
  let days: number[] = [];

  const getMinutes = () => getMinutesToNextWindow({ whitelist, days }, now);

  beforeEach(() => {
    SETTINGS.defaultTimeZone = 'Etc/GMT+0';
    days = [];
  });

  afterEach(SETTINGS.resetToOriginal);

  describe('in the window', () => {
    it('handles a window that starts right now and the window is < 1 hour', () => {
      whitelist = [{
        startMin: 0,
        startHour: 12,
        endMin: 2,
        endHour: 12
      }];
      expect(getMinutes()).toBe(0);
    });
    it('handles a window that starts right now and the window is > 1 hour', () => {
      whitelist = [{
        startMin: 0,
        startHour: 12,
        endMin: 2,
        endHour: 13
      }];
      expect(getMinutes()).toBe(0);
    });
    it('handles the last hour of a window', () => {
      whitelist = [{
        startMin: 0,
        startHour: 11,
        endMin: 1,
        endHour: 12
      }];
      expect(getMinutes()).toBe(0);
    });
    it('handles wrapping windows', () => {
      whitelist = [{
        startMin: 0,
        startHour: 23,
        endMin: 1,
        endHour: 12
      }];
      expect(getMinutes()).toBe(0);
    });
    it('considers multiple whitelist entries', () => {
      whitelist = [
        {
          startMin: 0,
          startHour: 11,
          endMin: 1,
          endHour: 11
        },
        {
          startMin: 45,
          startHour: 11,
          endMin: 1,
          endHour: 12
        }
      ];
    });
    it('considers day of the week', () => {
      days.push(2);
      whitelist = [{
        startMin: 0,
        startHour: 11,
        endMin: 1,
        endHour: 12
      }];
      expect(getMinutes()).toBe(0);
    });
  });

  describe('outside the window', () => {
    it('returns 1 if a window starts in one minute', () => {
      whitelist = [{
        startMin: 1,
        startHour: 12,
        endMin: 2,
        endHour: 12
      }];
      expect(getMinutes()).toBe(1);
    });
    it('returns 60 if a window starts in one hour', () => {
      whitelist = [{
        startMin: 0,
        startHour: 13,
        endMin: 0,
        endHour: 14
      }];
      expect(getMinutes()).toBe(60);
    });
    it('rolls over to the next day if there are no windows coming up today', () => {
      whitelist = [{
        startMin: 0,
        startHour: 1,
        endMin: 0,
        endHour: 2
      }];
      expect(getMinutes()).toBe(60 * 13);
    });
    it('rolls over to Thursday if it is the first available day', () => {
      whitelist = [{
        startMin: 0,
        startHour: 12,
        endMin: 2,
        endHour: 12
      }];
      days = [ 4 ];
      expect(getMinutes()).toBe(2 * 24 * 60);
    });
    it('rolls over to next week if Monday is the only available day', () => {
      whitelist = [{
        startMin: 0,
        startHour: 12,
        endMin: 2,
        endHour: 12
      }];
      days = [ 1 ];
      expect(getMinutes()).toBe(6 * 24 * 60);
    });
  });
});
