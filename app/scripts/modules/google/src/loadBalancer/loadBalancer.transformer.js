'use strict';

import _ from 'lodash';

import {GCEProviderSettings} from '../gce.settings';

const angular = require('angular');

module.exports = angular.module('spinnaker.gce.loadBalancer.transformer', [])
  .factory('gceLoadBalancerTransformer', function ($q) {

    function updateHealthCounts(container) {
      var instances = container.instances;
      var serverGroups = container.serverGroups || [container];
      container.instanceCounts = {
        up: instances.filter(function (instance) {
          return instance.health[0].state === 'InService';
        }).length,
        down: instances.filter(function (instance) {
          return instance.health[0].state === 'OutOfService';
        }).length,
        outOfService: serverGroups.reduce(function (acc, serverGroup) {
          return serverGroup.instances.filter(function (instance) {
            return instance.healthState === 'OutOfService';
          }).length + acc;
        }, 0),
      };
    }

    function transformInstance(instance, loadBalancer) {
      instance.health = instance.health || {};
      instance.provider = loadBalancer.type;
      instance.account = loadBalancer.account;
      instance.region = loadBalancer.region;
      instance.health.type = 'LoadBalancer';
      instance.healthState = instance.health.state ? instance.health.state === 'InService' ? 'Up' : 'Down' : 'OutOfService';
      instance.health = [instance.health];
      instance.loadBalancers = [loadBalancer.name];
    }

    function normalizeLoadBalancer(loadBalancer) {
      loadBalancer.serverGroups.forEach(function(serverGroup) {
        serverGroup.account = loadBalancer.account;
        if (serverGroup.detachedInstances) {
          serverGroup.detachedInstances = serverGroup.detachedInstances.map(function(instanceId) {
            return { id: instanceId };
          });
          serverGroup.instances = serverGroup.instances.concat(serverGroup.detachedInstances);
        } else {
          serverGroup.detachedInstances = [];
        }

        serverGroup.instances.forEach(function(instance) {
          transformInstance(instance, loadBalancer);
        });
        updateHealthCounts(serverGroup);
      });
      var activeServerGroups = _.filter(loadBalancer.serverGroups, {isDisabled: false});
      loadBalancer.provider = loadBalancer.type;
      loadBalancer.instances = _.chain(activeServerGroups).map('instances').flatten().value();
      loadBalancer.detachedInstances = _.chain(activeServerGroups).map('detachedInstances').flatten().value();
      if (_.get(loadBalancer, 'backendService.healthCheck')) {
        loadBalancer.backendService.healthCheck.timeout = loadBalancer.backendService.healthCheck.timeoutSec;
        loadBalancer.backendService.healthCheck.interval = loadBalancer.backendService.healthCheck.checkIntervalSec;
      }
      updateHealthCounts(loadBalancer);
      return $q.when(loadBalancer);
    }

    function convertLoadBalancerForEditing(loadBalancer) {
      var toEdit = {
        provider: 'gce',
        region: loadBalancer.region,
        credentials: loadBalancer.account,
        listeners: [],
        name: loadBalancer.name,
        regionZones: loadBalancer.availabilityZones
      };

      if (loadBalancer.elb) {
        var elb = loadBalancer.elb;

        toEdit.vpcId = elb.vpcid;

        if (elb.listenerDescriptions) {
          toEdit.listeners = elb.listenerDescriptions.map(function (description) {
            var listener = description.listener;
            return {
              protocol: listener.protocol,
              portRange: listener.loadBalancerPort,
              healthCheck: elb.healthCheck !== undefined
            };
          });
        }

        if (elb.healthCheck && elb.healthCheck.target) {
          toEdit.healthTimeout = elb.healthCheck.timeout;
          toEdit.healthInterval = elb.healthCheck.interval;
          toEdit.healthyThreshold = elb.healthCheck.healthyThreshold;
          toEdit.unhealthyThreshold = elb.healthCheck.unhealthyThreshold;

          var healthCheck = loadBalancer.elb.healthCheck.target;
          var protocolIndex = healthCheck.indexOf(':'),
            pathIndex = healthCheck.indexOf('/');

          if (protocolIndex !== -1 && pathIndex !== -1) {
            toEdit.healthCheckProtocol = healthCheck.substring(0, protocolIndex);
            toEdit.healthCheckPort = healthCheck.substring(protocolIndex + 1, pathIndex);
            toEdit.healthCheckPath = healthCheck.substring(pathIndex);
            if (!isNaN(toEdit.healthCheckPort)) {
              toEdit.healthCheckPort = Number(toEdit.healthCheckPort);
            }
          }
        } else {
          toEdit.healthCheckProtocol = 'HTTP';
          toEdit.healthCheckPort = 80;
          toEdit.healthCheckPath = '/';
          toEdit.healthTimeout = 5;
          toEdit.healthInterval = 10;
          toEdit.healthyThreshold = 10;
          toEdit.unhealthyThreshold = 2;
        }
      }
      return toEdit;
    }

    function constructNewLoadBalancerTemplate() {
      return {
        provider: 'gce',
        stack: '',
        detail: '',
        credentials: GCEProviderSettings.defaults.account,
        region: GCEProviderSettings.defaults.region,
        healthCheckProtocol: 'HTTP',
        healthCheckPort: 80,
        healthCheckPath: '/',
        healthTimeout: 5,
        healthInterval: 10,
        healthyThreshold: 10,
        unhealthyThreshold: 2,
        regionZones: [],
        listeners: [
          {
            protocol: 'TCP',
            portRange: '8080',
            healthCheck: true
          }
        ]
      };
    }

    return {
      normalizeLoadBalancer: normalizeLoadBalancer,
      convertLoadBalancerForEditing: convertLoadBalancerForEditing,
      constructNewLoadBalancerTemplate: constructNewLoadBalancerTemplate,
    };

  });
