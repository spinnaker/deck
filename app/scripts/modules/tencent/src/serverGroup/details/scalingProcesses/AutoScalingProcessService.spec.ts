import { ITencentAsg, ITencentServerGroup } from 'tencent/domain';

import { AutoScalingProcessService } from './AutoScalingProcessService';

describe('AutoScalingProcessService', () => {
  describe('normalizeScalingProcesses', () => {
    it('returns an empty list if no asg or suspendedProcesses present on server group', function() {
      expect(AutoScalingProcessService.normalizeScalingProcesses({} as ITencentServerGroup)).toEqual([]);
      expect(AutoScalingProcessService.normalizeScalingProcesses({ asg: {} } as ITencentServerGroup)).toEqual([]);
    });

    it('returns all processes normalized if suspendedProcesses is empty', function() {
      const asg = {
        suspendedProcesses: [],
      } as ITencentAsg;
      const normalized = AutoScalingProcessService.normalizeScalingProcesses({ asg: asg } as ITencentServerGroup);
      expect(normalized.length).toBe(8);
      expect(normalized.filter(process => process.enabled).length).toBe(8);
      expect(normalized.map(process => process.name)).toEqual([
        'Launch',
        'Terminate',
        'AddToLoadBalancer',
        'AlarmNotification',
        'AZRebalance',
        'HealthCheck',
        'ReplaceUnhealthy',
        'ScheduledActions',
      ]);
      expect(normalized.filter(process => process.suspensionDate)).toEqual([]);
    });

    it('builds suspension date for suspended processes', function() {
      const asg = {
        suspendedProcesses: [
          {
            processName: 'Launch',
            suspensionReason: 'User suspended at 2016-01-12T22:59:46Z',
          },
        ],
      };
      const normalized = AutoScalingProcessService.normalizeScalingProcesses({ asg: asg } as ITencentServerGroup);
      expect(normalized.length).toBe(8);
      expect(normalized.filter(process => process.enabled).length).toBe(7);
      expect(normalized.map(process => process.name)).toEqual([
        'Launch',
        'Terminate',
        'AddToLoadBalancer',
        'AlarmNotification',
        'AZRebalance',
        'HealthCheck',
        'ReplaceUnhealthy',
        'ScheduledActions',
      ]);
      expect(normalized.filter(process => process.suspensionDate).length).toBe(1);
      expect(normalized.filter(p => p.suspensionDate).map(p => p.suspensionDate)).toEqual([1452639586000]);
    });
  });

  describe('getDisabledDate', function() {
    it('returns null when server group is not disabled, regardless of suspended processes', function() {
      const asg = {
        suspendedProcesses: [
          {
            processName: 'AddToLoadBalancer',
            suspensionReason: 'User suspended at 2016-01-12T22:59:46Z',
          },
        ],
      };
      expect(AutoScalingProcessService.getDisabledDate({ asg: asg } as ITencentServerGroup)).toBeNull();
    });

    it('returns null when server group is disabled but suspended process for AddToLoadBalancer not present', function() {
      const asg = {
        suspendedProcesses: [],
      } as ITencentAsg;
      expect(
        AutoScalingProcessService.getDisabledDate({ isDisabled: true, asg: asg } as ITencentServerGroup),
      ).toBeNull();
    });

    it('returns suspension date when server group is disabled and AddToLoadBalancer suspended', function() {
      const asg = {
        suspendedProcesses: [
          {
            processName: 'AddToLoadBalancer',
            suspensionReason: 'User suspended at 2016-01-12T22:59:46Z',
          },
        ],
      };
      expect(AutoScalingProcessService.getDisabledDate({ isDisabled: true, asg: asg } as ITencentServerGroup)).toEqual(
        1452639586000,
      );
    });
  });
});
