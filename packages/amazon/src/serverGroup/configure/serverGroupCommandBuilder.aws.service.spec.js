'use strict';

import { AccountService, SubnetReader } from '@spinnaker/core';

import { AWSProviderSettings } from '../../aws.settings';
import { mockLaunchTemplate, mockServerGroup } from '@spinnaker/mocks';

describe('Service: awsServerGroup', function () {
  beforeEach(window.module(require('./serverGroupCommandBuilder.service').name));

  let instanceTypeService;
  beforeEach(
    window.inject(function (awsServerGroupCommandBuilder, _instanceTypeService_, _$q_, $rootScope) {
      this.service = awsServerGroupCommandBuilder;
      this.$q = _$q_;
      this.$scope = $rootScope;
      instanceTypeService = _instanceTypeService_;
      spyOn(instanceTypeService, 'getCategoryForMultipleInstanceTypes').and.returnValue(_$q_.when('custom'));
    }),
  );

  afterEach(AWSProviderSettings.resetToOriginal);

  describe('buildServerGroupCommandFromPipeline', function () {
    beforeEach(function () {
      this.cluster = {
        loadBalancers: ['elb-1'],
        account: 'prod',
        availabilityZones: {
          'us-west-1': ['d', 'g'],
        },
        capacity: {
          min: 1,
          max: 1,
        },
        instanceType: 'm5.large',
      };

      AWSProviderSettings.defaults = {
        account: 'test',
        region: 'us-east-1',
      };

      spyOn(AccountService, 'getAvailabilityZonesForAccountAndRegion').and.returnValue(this.$q.when(['d', 'g']));

      spyOn(AccountService, 'getCredentialsKeyedByAccount').and.returnValue(
        this.$q.when({
          test: ['us-east-1', 'us-west-1'],
          prod: ['us-west-1', 'eu-west-1'],
        }),
      );
    });

    it('applies account, region from cluster', function () {
      var command = null;
      this.service.buildServerGroupCommandFromPipeline({}, this.cluster).then(function (result) {
        command = result;
      });

      this.$scope.$digest();

      expect(command.credentials).toBe('prod');
      expect(command.region).toBe('us-west-1');
    });

    it('sets usePreferredZones', function () {
      var command = null;
      this.service.buildServerGroupCommandFromPipeline({}, this.cluster).then(function (result) {
        command = result;
      });

      this.$scope.$digest();
      expect(command.viewState.usePreferredZones).toBe(true);

      // remove an availability zone, should be false
      this.cluster.availabilityZones['us-west-1'].pop();
      this.service.buildServerGroupCommandFromPipeline({}, this.cluster).then(function (result) {
        command = result;
      });

      this.$scope.$digest();
      expect(command.viewState.usePreferredZones).toBe(false);
    });

    it('extracts instanceProfile from server group correctly', function () {
      const clusters = [
        {
          cluster: {
            ...this.cluster,
            instanceType: 'r5.large',
          },
          expected: {
            instanceTypes: ['r5.large'],
            useSimpleInstanceTypeSelector: true,
          },
        },
        {
          cluster: {
            ...this.cluster,
            instanceType: 'm5.large',
          },
          expected: {
            instanceTypes: ['m5.large'],
            useSimpleInstanceTypeSelector: true,
          },
        },
        {
          cluster: {
            ...this.cluster,
            spotAllocationStrategy: 'capacity-optimized',
            launchTemplateOverridesForInstanceType: [
              {
                instanceType: 't3.nano',
                weightedCapacity: '2',
              },
              {
                instanceType: 'm5.large',
                weightedCapacity: '4',
              },
            ],
          },
          expected: {
            instanceTypes: ['t3.nano', 'm5.large'],
            useSimpleInstanceTypeSelector: false,
          },
        },
        {
          cluster: {
            ...this.cluster,
            spotAllocationStrategy: 'capacity-optimized',
            launchTemplateOverridesForInstanceType: [
              {
                instanceType: 't3.nano',
                weightedCapacity: '2',
              },
              {
                instanceType: 't3.micro',
                weightedCapacity: '4',
              },
            ],
          },
          expected: {
            instanceTypes: ['t3.nano', 't3.micro'],
            useSimpleInstanceTypeSelector: false,
          },
        },
      ];

      for (let test of clusters) {
        let command = null;
        this.service.buildServerGroupCommandFromPipeline({}, test.cluster).then(function (result) {
          command = result;
        });
        this.$scope.$digest();

        expect(instanceTypeService.getCategoryForMultipleInstanceTypes).toHaveBeenCalledWith(
          'aws',
          test.expected.instanceTypes,
        );
        expect(command.viewState.useSimpleInstanceTypeSelector).toBe(test.expected.useSimpleInstanceTypeSelector);
      }
    });
  });

  describe('buildServerGroupCommandFromExisting', function () {
    beforeEach(function () {
      spyOn(AccountService, 'getPreferredZonesByAccount').and.returnValue(this.$q.when([]));
      spyOn(SubnetReader, 'listSubnets').and.returnValue(this.$q.when([]));
    });

    it('retains non-core suspended processes', function () {
      var serverGroup = {
        asg: {
          availabilityZones: [],
          vpczoneIdentifier: '',
          suspendedProcesses: [
            { processName: 'Launch' },
            { processName: 'Terminate' },
            { processName: 'AZRebalance' },
            { processName: 'AddToLoadBalancer' },
          ],
        },
        launchTemplate: mockLaunchTemplate,
      };
      var command = null;
      this.service.buildServerGroupCommandFromExisting({}, serverGroup).then(function (result) {
        command = result;
      });

      this.$scope.$digest();
      expect(command.suspendedProcesses).toEqual(['AZRebalance']);
    });

    it('sets source capacity flags when creating for pipeline', function () {
      var serverGroup = {
        asg: {
          availabilityZones: [],
          vpczoneIdentifier: '',
          suspendedProcesses: [],
        },
        launchTemplate: mockLaunchTemplate,
      };
      var command = null;
      this.service.buildServerGroupCommandFromExisting({}, serverGroup, 'editPipeline').then(function (result) {
        command = result;
      });

      this.$scope.$digest();

      expect(command.viewState.useSimpleCapacity).toBe(false);
      expect(command.useSourceCapacity).toBe(true);
    });

    it('extracts instanceProfile and useSimpleInstanceTypeSelector from server group correctly', function () {
      const asg = {
        autoScalingGroupName: 'myasg-test-v000',
        availabilityZones: [],
        vpczoneIdentifier: '',
        suspendedProcesses: [],
        enabledMetrics: [],
      };

      const serverGroups = [
        {
          sg: {
            ...mockServerGroup,
            asg: asg,
            launchConfig: {
              instanceType: 'r5.large',
              securityGroups: [],
            },
          },
          expected: {
            instanceTypes: ['r5.large'],
            useSimpleInstanceTypeSelector: true,
          },
        },
        {
          sg: {
            ...mockServerGroup,
            asg: asg,
            launchTemplate: mockLaunchTemplate,
          },
          expected: {
            instanceTypes: ['m5.large'],
            useSimpleInstanceTypeSelector: true,
          },
        },
        {
          sg: {
            ...mockServerGroup,
            asg: asg,
            mixedInstancesPolicy: {
              allowedInstanceTypes: ['m5.large'],
              instancesDistribution: {
                onDemandAllocationStrategy: 'prioritized',
                onDemandBaseCapacity: 1,
                onDemandPercentageAboveBaseCapacity: 50,
                spotAllocationStrategy: 'capacity-optimized',
                spotMaxPrice: '1.5',
              },
              launchTemplates: [mockLaunchTemplate],
            },
          },
          expected: {
            instanceTypes: ['m5.large'],
            useSimpleInstanceTypeSelector: false,
          },
        },
        {
          sg: {
            ...mockServerGroup,
            asg: asg,
            mixedInstancesPolicy: {
              allowedInstanceTypes: ['t3.nano', 'm5.large'],
              instancesDistribution: {
                onDemandAllocationStrategy: 'prioritized',
                onDemandBaseCapacity: 1,
                onDemandPercentageAboveBaseCapacity: 50,
                spotAllocationStrategy: 'capacity-optimized',
                spotMaxPrice: '1.5',
              },
              launchTemplates: [mockLaunchTemplate],
              launchTemplateOverridesForInstanceType: [
                {
                  instanceType: 't3.nano',
                  weightedCapacity: '2',
                },
                {
                  instanceType: 'm5.large',
                  weightedCapacity: '4',
                },
              ],
            },
          },
          expected: {
            instanceTypes: ['t3.nano', 'm5.large'],
            useSimpleInstanceTypeSelector: false,
          },
        },
      ];

      for (let test of serverGroups) {
        let command = null;
        this.service.buildServerGroupCommandFromExisting({}, test.sg, 'clone').then(function (result) {
          command = result;
        });
        this.$scope.$digest();

        expect(instanceTypeService.getCategoryForMultipleInstanceTypes).toHaveBeenCalledWith(
          'aws',
          test.expected.instanceTypes,
        );
        expect(command.viewState.useSimpleInstanceTypeSelector).toBe(test.expected.useSimpleInstanceTypeSelector);
      }
    });
  });
});
