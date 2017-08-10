'use strict';

const angular = require('angular');

import { GCE_LOAD_BALANCING_POLICY_SELECTOR } from './wizard/loadBalancingPolicy/loadBalancingPolicySelector.component';
import { GCE_AUTOHEALING_POLICY_SELECTOR } from './wizard/autoHealingPolicy/autoHealingPolicySelector.component';
import { GCE_CACHE_REFRESH } from 'google/cache/cacheRefresh.component';
import { GCE_CUSTOM_INSTANCE_CONFIGURER } from './wizard/customInstance/customInstanceConfigurer.component';
import { GCE_DISK_CONFIGURER } from './wizard/advancedSettings/diskConfigurer.component';

module.exports = angular.module('spinnaker.serverGroup.configure.gce', [
  require('../../autoscalingPolicy/components/basicSettings/basicSettings.component.js'),
  require('../../autoscalingPolicy/components/metricSettings/metricSettings.component.js'),
  GCE_LOAD_BALANCING_POLICY_SELECTOR,
  GCE_AUTOHEALING_POLICY_SELECTOR,
  require('./../../instance/custom/customInstanceBuilder.gce.service.js'),
  GCE_CACHE_REFRESH,
  GCE_CUSTOM_INSTANCE_CONFIGURER,
  GCE_DISK_CONFIGURER,
  require('../serverGroup.transformer.js'),
  require('./serverGroupConfiguration.service.js'),
  require('./wizard/advancedSettings/advancedSettingsSelector.directive.js'),
  require('./wizard/capacity/advancedCapacitySelector.component.js'),
  require('./wizard/capacity/simpleCapacitySelector.component.js'),
  require('./wizard/loadBalancers/loadBalancerSelector.directive.js'),
  require('./wizard/location/basicSettings.controller.js'),
  require('./wizard/securityGroups/securityGroupsRemoved.directive.js'),
  require('./wizard/securityGroups/securityGroupSelector.directive.js'),
  require('./wizard/zones/regionalSelector.directive.js'),
  require('./wizard/zones/zoneSelector.directive.js'),
]);
