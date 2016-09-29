'use strict';

import _ from 'lodash';

// Most of this logic has been moved to filter.model.service.js, so these act more as integration tests now
describe('Service: clusterFilterService', function () {

  var service;
  var clusterService;
  var ClusterFilterModel;
  var MultiselectModel;
  var applicationJSON;
  var groupedJSON;
  var $timeout;

  beforeEach(function() {
    spyOn(_, 'debounce').and.callFake(fn => (app) => $timeout(fn(app)));
    window.module(
      require('./clusterFilter.service.js'),
      require('./clusterFilter.model.js'),
      require('../cluster.service'),
      require('../../../../../../test/mock/mockApplicationData.js')
    );
    window.inject(
      function (clusterFilterService, _ClusterFilterModel_, _MultiselectModel_, _$timeout_, _applicationJSON_, _groupedJSON_, _clusterService_) {
        service = clusterFilterService;
        clusterService = _clusterService_;
        ClusterFilterModel = _ClusterFilterModel_;
        MultiselectModel = _MultiselectModel_;
        $timeout = _$timeout_;
        ClusterFilterModel.groups = [];

        applicationJSON = _applicationJSON_;
        groupedJSON = _groupedJSON_;
        groupedJSON[0].subgroups[0].cluster = applicationJSON.clusters[0];
        groupedJSON[1].subgroups[0].cluster = applicationJSON.clusters[1];
      }
    );
  });

  beforeEach(function() {
    this.verifyTags = function(expectedTags) {
      var actual = ClusterFilterModel.tags;
      expect(actual.length).toBe(expectedTags.length);
      expectedTags.forEach(function(expected) {
        expect(actual.some(function(test) {
          return test.key === expected.key && test.label === expected.label && test.value === expected.value;
        })).toBe(true);
      });
    };
  });

  describe('Updating the cluster group', function () {

    it('no filter: should be transformed', function () {
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
    });

    describe('filter by cluster', function () {
      it('should filter by cluster name as an exact match', function () {
        ClusterFilterModel.sortFilter.filter = 'cluster:in-us-west-1-only';
        var expected = _.filter(groupedJSON, {subgroups: [{heading: 'in-us-west-1-only' }]});
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(expected);
      });

      it('should not match on partial cluster name', function () {
        ClusterFilterModel.sortFilter.filter = 'cluster:in-us-west-1';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual([]);
      });

    });

    describe('filter by vpc', function () {
      it('should filter by vpc name as an exact match', function () {
        ClusterFilterModel.sortFilter.filter = 'vpc:main';
        var expected = _.filter(groupedJSON, {subgroups: [{heading: 'in-us-west-1-only' }]});
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(expected);
      });

      it('should not match on partial vpc name', function () {
        ClusterFilterModel.sortFilter.filter = 'vpc:main-old';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual([]);
      });
    });

    describe('filter by clusters', function () {
      it('should filter by cluster names as an exact match', function () {
        ClusterFilterModel.sortFilter.filter = 'clusters:in-us-west-1-only';
        var expected = _.filter(groupedJSON, {subgroups: [{heading: 'in-us-west-1-only' }]});
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(expected);
      });

      it('should not match on partial cluster name', function () {
        ClusterFilterModel.sortFilter.filter = 'clusters:in-us-west-1';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual([]);
      });

      it('should perform an OR match on comma separated list, ignoring spaces', function () {
        ClusterFilterModel.sortFilter.filter = 'clusters:in-us-west-1-only, in-eu-east-2-only';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(groupedJSON);
        ClusterFilterModel.sortFilter.filter = 'clusters:in-us-west-1-only,in-eu-east-2-only';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(groupedJSON);
        ClusterFilterModel.sortFilter.filter = 'clusters: in-us-west-1-only,in-eu-east-2-only';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(groupedJSON);
        ClusterFilterModel.sortFilter.filter = 'clusters: in-us-west-1-only, in-eu-east-2-only';
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      });

    });

    describe('filtering by account type', function () {
      it('1 account filter: should be transformed showing only prod accounts', function () {
        ClusterFilterModel.sortFilter.account = {prod: true};
        var expectedProd = _.filter(groupedJSON, {heading:'prod'});
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(expectedProd);
        this.verifyTags([
          { key: 'account', label: 'account', value: 'prod' }
        ]);
      });

      it('All account filters: should show all accounts', function () {
        ClusterFilterModel.sortFilter.account = {prod: true, test: true};
        service.updateClusterGroups(applicationJSON);
        $timeout.flush();
        expect(ClusterFilterModel.groups).toEqual(groupedJSON);
        this.verifyTags([
          { key: 'account', label: 'account', value: 'prod' },
          { key: 'account', label: 'account', value: 'test' },
        ]);
      });
    });
  });

  describe('filter by region', function () {
    it('1 region: should filter by that region ', function () {
      ClusterFilterModel.sortFilter.region = {'us-west-1' : true};
      var expected = _.filter(groupedJSON, {subgroups: [{heading: 'in-us-west-1-only' }]});
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'region', label: 'region', value: 'us-west-1' },
      ]);
    });
  });

  describe('filter by healthy status', function () {
    it('should filter by health if checked', function () {
      ClusterFilterModel.sortFilter.status = {healthy : true };
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                instances: [ { health: [{state: 'Up'}]}]
              }]
            }]
          }]
        }
      );
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'healthy' },
      ]);
    });

    it('should not filter by healthy if unchecked', function () {
      ClusterFilterModel.sortFilter.status = {healthy : false};
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });
  });

  describe('filter by unhealthy status', function () {
    it('should filter by unhealthy status if checked', function () {
      ClusterFilterModel.sortFilter.status = {unhealthy: true};
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                instances: [ { health: [{state: 'Down'}]}]
              }]
            }]
          }]
        }
      );

      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'unhealthy' },
      ]);
    });

    it('should not filter by unhealthy if unchecked', function () {
      ClusterFilterModel.sortFilter.status = {unhealthy : false};
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });

  });

  describe('filter by both healthy and unhealthy status', function () {
    it('should not filter by healthy if unchecked', function () {
      ClusterFilterModel.sortFilter.status = {unhealthy : true, healthy: true};
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                instances: [ { health: [{state: 'Down'}]}]
              }]
            }]
          }]
        }
      );
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'healthy' },
        { key: 'status', label: 'status', value: 'unhealthy' },
      ]);
    });
  });

  describe('filter by disabled status', function () {
    it('should filter by disabled status if checked', function () {
      ClusterFilterModel.sortFilter.status = {Disabled: true};
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                isDisabled: true
              }]
            }]
          }]
        }
      );
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'Disabled' },
      ]);
    });

    it('should not filter if the status is unchecked', function () {
      ClusterFilterModel.sortFilter.status = { Disabled: false };
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });
  });

  describe('filter by starting status', function() {
    it('should filter by starting status if checked', function() {
      var appCopy = _.cloneDeep(applicationJSON);
      var starting = { healthState: 'Unknown'},
        serverGroup = appCopy.serverGroups.data[0];
      serverGroup.instances.push(starting);

      ClusterFilterModel.sortFilter.status = {Starting: true};
      service.updateClusterGroups(appCopy);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual([]);

      starting.healthState = 'Starting';
      serverGroup.instanceCounts.starting = 1;
      service.updateClusterGroups(appCopy);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'Starting' },
      ]);
    });
  });

  describe('filter by out of service status', function() {
    it('should filter by out of service status if checked', function() {
      var appCopy = _.cloneDeep(applicationJSON);
      var starting = { healthState: 'Unknown' },
        serverGroup = appCopy.serverGroups.data[0];
      serverGroup.instances.push(starting);

      ClusterFilterModel.sortFilter.status = {OutOfService: true};
      service.updateClusterGroups(appCopy);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual([]);

      starting.healthState = 'OutOfService';
      serverGroup.instanceCounts.outOfService = 1;
      service.updateClusterGroups(appCopy);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      this.verifyTags([
        { key: 'status', label: 'status', value: 'Out of Service' },
      ]);
    });
  });

  describe('filtered by provider type', function () {
    it('should filter by aws if checked', function () {
      ClusterFilterModel.sortFilter.providerType = {aws : true};
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                type: 'aws'
              }]
            }]
          }]
        }
      );
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'providerType', label: 'provider', value: 'aws' },
      ]);
    });

    it('should not filter if no provider type is selected', function () {
      ClusterFilterModel.sortFilter.providerType = undefined;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });

    it('should not filter if all provider are selected', function () {
      ClusterFilterModel.sortFilter.providerType = {aws: true, gce: true};
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([
        { key: 'providerType', label: 'provider', value: 'aws' },
        { key: 'providerType', label: 'provider', value: 'gce' },
      ]);
    });
  });

  describe('filtered by instance type', function () {
    it('should filter by m3.large if checked', function () {
      ClusterFilterModel.sortFilter.instanceType = {'m3.large': true};
      var expected = _.filter(groupedJSON,
        {
          subgroups: [{
            subgroups: [{
              serverGroups: [{
                instanceType: 'm3.large'
              }]
            }]
          }]
        }
      );
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(expected);
      this.verifyTags([
        { key: 'instanceType', label: 'instance type', value: 'm3.large' },
      ]);
    });

    it('should not filter if no instance type selected', function () {
      ClusterFilterModel.sortFilter.instanceType = undefined;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });

    it('should not filter if the instance type is unchecked', function () {
      ClusterFilterModel.sortFilter.instanceType = {'m3.large' : false};
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });
  });

  describe('filter by instance counts', function () {

    it('should filter by min instances', function () {
      ClusterFilterModel.sortFilter.minInstances = 1;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual([groupedJSON[1]]);
      this.verifyTags([
        { key: 'minInstances', label: 'instance count (min)', value: 1 }
      ]);

      ClusterFilterModel.sortFilter.minInstances = 0;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([
        { key: 'minInstances', label: 'instance count (min)', value: 0 }
      ]);

      ClusterFilterModel.sortFilter.minInstances = 2;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual([]);
      this.verifyTags([
        { key: 'minInstances', label: 'instance count (min)', value: 2 }
      ]);
    });

    it('should filter by max instances', function() {
      ClusterFilterModel.sortFilter.maxInstances = 0;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual([groupedJSON[0]]);
      this.verifyTags([
        { key: 'maxInstances', label: 'instance count (max)', value: 0 }
      ]);

      ClusterFilterModel.sortFilter.maxInstances = 1;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([
        { key: 'maxInstances', label: 'instance count (max)', value: 1 }
      ]);

      ClusterFilterModel.sortFilter.maxInstances = null;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(ClusterFilterModel.groups).toEqual(groupedJSON);
      this.verifyTags([]);
    });
  });

  describe('multiInstance filtering', function () {
    beforeEach(function() {
      this.navigationSynced = false;
      ClusterFilterModel.sortFilter.multiselect = true;
      spyOn(MultiselectModel, 'syncNavigation').and.callFake(() => this.navigationSynced = true);
    });

    it('should remove all instanceIds if server group is no longer visible, and add back when visible again', function () {
      ClusterFilterModel.sortFilter.listInstances = true;
      let serverGroup = applicationJSON.serverGroups.data[0],
          multiselectGroup = MultiselectModel.getOrCreateInstanceGroup(serverGroup);

      serverGroup.instances.push({id: 'i-1234'});
      MultiselectModel.toggleSelectAll(serverGroup, ['i-1234']);
      expect(multiselectGroup.instanceIds).toEqual(['i-1234']);

      ClusterFilterModel.sortFilter.region['us-east-3'] = true;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();

      expect(multiselectGroup.instanceIds).toEqual([]);

      ClusterFilterModel.sortFilter.region['us-east-3'] = false;
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();

      expect(multiselectGroup.instanceIds).toEqual(['i-1234']);

    });

    it('should remove instances that are no longer visible', function () {
      ClusterFilterModel.sortFilter.listInstances = true;
      let serverGroup = applicationJSON.serverGroups.data[0];

      MultiselectModel.toggleInstance(serverGroup, 'i-1234');
      MultiselectModel.toggleInstance(serverGroup, 'i-2345');
      serverGroup.instances.push({id: 'i-1234'});

      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-1234')).toBe(true);
      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-2345')).toBe(true);

      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-1234')).toBe(true);
      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-2345')).toBe(false);

      expect(this.navigationSynced).toBe(true);

    });

    it('should add all instances when selectAll is selected and new instances appear in server group', function () {
      ClusterFilterModel.sortFilter.listInstances = true;
      let serverGroup = applicationJSON.serverGroups.data[0];

      MultiselectModel.getOrCreateInstanceGroup(serverGroup).selectAll = true;
      MultiselectModel.toggleInstance(serverGroup, 'i-1234');
      serverGroup.instances.push({id: 'i-1234'});
      serverGroup.instances.push({id: 'i-2345'});

      service.updateClusterGroups(applicationJSON);
      $timeout.flush();
      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-1234')).toBe(true);
      expect(MultiselectModel.instanceIsSelected(serverGroup, 'i-2345')).toBe(true);

      expect(this.navigationSynced).toBe(true);
    });

    it('should remove all instance groups when listInstances is false', function () {
      ClusterFilterModel.sortFilter.listInstances = false;
      let serverGroup = applicationJSON.serverGroups.data[0];

      MultiselectModel.toggleInstance(serverGroup, 'i-1234');

      expect(MultiselectModel.instanceGroups.length).toBe(1);
      service.updateClusterGroups(applicationJSON);
      $timeout.flush();

      expect(MultiselectModel.instanceGroups.length).toBe(0);
      expect(this.navigationSynced).toBe(true);
    });
  });

  describe('clear all filters', function () {

    beforeEach(function () {
      ClusterFilterModel.sortFilters = undefined;
    });

    it('should clear set providerType filter', function () {
      ClusterFilterModel.sortFilter.providerType = {aws: true};
      expect(ClusterFilterModel.sortFilter.providerType).toBeDefined();
      service.clearFilters();
      expect(ClusterFilterModel.sortFilter.providerType).toBeUndefined();
      this.verifyTags([]);
    });

  });

  describe('group diffing', function() {
    beforeEach(function() {
      this.clusterA = { account: 'prod', category: 'serverGroup', name: 'cluster-a' };
      this.clusterB = { account: 'prod', category: 'serverGroup', name: 'cluster-b' };
      this.serverGroup001 = { cluster: 'cluster-a', name: 'cluster-a-v001', account: 'prod', region: 'us-east-1', stringVal: 'original', category: 'serverGroup', instances: [] };
      this.serverGroup000 = { cluster: 'cluster-a', name: 'cluster-a-v000', account: 'prod', region: 'us-east-1', stringVal: 'should be deleted', category: 'serverGroup', instances: [] };
      ClusterFilterModel.groups = [
        {
          heading: 'prod',
          subgroups: [
            {
              heading: 'cluster-a',
              category: 'serverGroup',
              cluster: { name: 'cluster-a' },
              subgroups: [
                {
                  heading: 'us-east-1',
                  category: 'serverGroup',
                  serverGroups: [
                    this.serverGroup000,
                    this.serverGroup001,
                  ]
                }
              ]
            },
          ],
        },
      ];
    });

    it('adds a group when new one provided', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-a', name: 'cluster-a-v003', account: 'test', region: 'us-east-1', stringVal: 'new', category: 'serverGroup' },
        ]},
        clusters: [
          this.clusterA,
          { name: 'cluster-a', account: 'test', category: 'serverGroup' },
        ]
      };
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(2);
      expect(ClusterFilterModel.groups[1].heading).toBe('test');
      expect(ClusterFilterModel.groups[1].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[1].subgroups[0].heading).toBe('cluster-a');
      expect(ClusterFilterModel.groups[1].subgroups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[1].subgroups[0].subgroups[0].heading).toBe('us-east-1');
      expect(ClusterFilterModel.groups[1].subgroups[0].subgroups[0].serverGroups.length).toBe(1);
      expect(ClusterFilterModel.groups[1].subgroups[0].subgroups[0].serverGroups[0].name).toBe('cluster-a-v003');
    });

    it('adds a subgroup when new one provided', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-b', name: 'cluster-a-v003', account: 'prod', region: 'us-east-1', stringVal: 'new', category: 'serverGroup' },
        ]},
        clusters: [
          this.clusterA,
          this.clusterB,
        ]
      };
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(2);
      expect(ClusterFilterModel.groups[0].subgroups[1].heading).toBe('cluster-b');
      expect(ClusterFilterModel.groups[0].subgroups[1].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[1].subgroups[0].heading).toBe('us-east-1');
      expect(ClusterFilterModel.groups[0].subgroups[1].subgroups[0].serverGroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[1].subgroups[0].serverGroups[0].name).toBe('cluster-a-v003');
    });

    it('adds a sub-subgroup when new one provided', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-a', name: 'cluster-a-v003', account: 'prod', region: 'us-west-1', stringVal: 'new', category: 'serverGroup', instances: [] },
        ]},
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups.length).toBe(2);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[1].heading).toBe('us-west-1');
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[1].serverGroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[1].serverGroups[0].name).toBe('cluster-a-v003');
    });

    it('adds a server group when new one provided in same sub-sub-group', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-a', name: 'cluster-a-v003', account: 'prod', region: 'us-east-1', stringVal: 'new', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups.length).toBe(3);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[2].name).toBe('cluster-a-v003');
    });

    it('removes a group when one goes away', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-a', name: 'cluster-a-v003', account: 'test', region: 'us-east-1', stringVal: 'new', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(2);

      application.serverGroups.data.splice(0, 2);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].heading).toBe('test');
    });

    it('removes a subgroup when one goes away', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-b', name: 'cluster-a-v003', account: 'prod', region: 'us-east-1', stringVal: 'new', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(2);

      application.serverGroups.data.splice(0, 2);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].heading).toBe('cluster-b');
    });

    it('removes a sub-subgroup when one goes away', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup000,
          this.serverGroup001,
          { cluster: 'cluster-a', name: 'cluster-a-v003', account: 'prod', region: 'us-west-1', stringVal: 'new', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups.length).toBe(2);

      application.serverGroups.data.splice(0, 2);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].heading).toBe('us-west-1');
    });

    it('removes a server group when one goes away', function() {
      var application = {
        serverGroups: { data: [
          this.serverGroup001,
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups.length).toBe(1);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0].name).toBe('cluster-a-v001');
    });

    it('leaves server groups alone when stringVal does not change', function() {
      var application = {
        serverGroups: { data: [
          { cluster: 'cluster-a', name: 'cluster-a-v000', account: 'prod', region: 'us-east-1', stringVal: 'should be deleted', category: 'serverGroup', instances: [] },
          { cluster: 'cluster-a', name: 'cluster-a-v001', account: 'prod', region: 'us-east-1', stringVal: 'original', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0]).toBe(this.serverGroup000);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[1]).toBe(this.serverGroup001);
    });

    it('replaces server group when stringVal changes', function() {
      var application = {
        serverGroups: { data: [
          { cluster: 'cluster-a', name: 'cluster-a-v000', account: 'prod', region: 'us-east-1', stringVal: 'mutated', category: 'serverGroup', instances: [] },
          { cluster: 'cluster-a', name: 'cluster-a-v001', account: 'prod', region: 'us-east-1', stringVal: 'original', category: 'serverGroup', instances: [] },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0]).not.toBe(this.serverGroup000);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0]).toBe(application.serverGroups.data[0]);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[1]).toBe(this.serverGroup001);
    });

    it('adds executions and running tasks, even when stringVal does not change', function () {
      var runningTasks = [ { name: 'a' } ],
          executions = [ { name: 'b' } ];
      var application = {
        serverGroups: { data: [
          { cluster: 'cluster-a', name: 'cluster-a-v001', account: 'prod', region: 'us-east-1', stringVal: 'original',
            runningTasks: runningTasks, executions: executions, category: 'serverGroup', instances: []
          },
        ]}
      };
      application.clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      service.updateClusterGroups(application);
      $timeout.flush();
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0]).toBe(this.serverGroup001);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0].runningTasks).toBe(runningTasks);
      expect(ClusterFilterModel.groups[0].subgroups[0].subgroups[0].serverGroups[0].executions).toBe(executions);
    });
  });
});
