import {ITimeoutService, mock} from 'angular';
import {SCHEDULER_FACTORY, SchedulerFactory} from './scheduler.factory';

describe('scheduler', function() {
  const angular = require('angular');

  let $timeout: ITimeoutService;

  beforeEach(function() {
    const pollSchedule = 25;
    mock.module(
      SCHEDULER_FACTORY
    );

    this.pollSchedule = pollSchedule;

    mock.inject(function(schedulerFactory: SchedulerFactory, _$timeout_: ITimeoutService) {
      this.scheduler = schedulerFactory.createScheduler();
      $timeout = _$timeout_;
    });

    this.test = {
      call: angular.noop,
    };
  });

  describe('#scheduleImmediate', function() {
    it('invokes all subscribed callbacks immediately', function() {
      const numSubscribers = 20;

      spyOn(this.test, 'call');
      for (let i = 0; i < numSubscribers; i++) {
        this.scheduler.subscribe(this.test.call);
      }
      const pre = this.test.call.calls.count();
      this.scheduler.scheduleImmediate();
      expect(this.test.call.calls.count() - pre).toBe(numSubscribers);
    });

    it('does not fire next repeatedly when scheduleImmediate is called within the interval window', function () {
      spyOn(this.test, 'call');
      this.scheduler.subscribe(this.test.call);
      this.scheduler.scheduleImmediate();
      this.scheduler.scheduleImmediate();
      this.scheduler.scheduleImmediate();
      this.scheduler.scheduleImmediate();
      expect(this.test.call.calls.count()).toBe(4);

      $timeout.flush();
      expect(this.test.call.calls.count()).toBe(5);

      // verify no outstanding timeouts
      expect($timeout.flush).toThrow();
    });
  });
});
