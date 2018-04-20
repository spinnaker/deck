'use strict';

const angular = require('angular');

import { CLOUD_PROVIDER_REGISTRY, DeploymentStrategyRegistry } from '@spinnaker/core';

import { ECS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import { ECS_LOAD_BALANCER_SELECTOR } from './serverGroup/configure/wizard/loadBalancers/loadBalancerSelector.component';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { IAM_ROLE_READ_SERVICE } from './iamRoles/iamRole.read.service';
import { ECS_CLUSTER_READ_SERVICE } from './ecsCluster/ecsCluster.read.service';
import { METRIC_ALARM_READ_SERVICE } from './metricAlarm/metricAlarm.read.service';
import { PLACEMENT_STRATEGY_SERVICE } from './placementStrategy/placementStrategy.service';
import './ecs.help';
import { COMMON_MODULE } from './common/common.module';

import './logo/ecs.logo.less';

require('./ecs.settings.ts');

// load all templates into the $templateCache
let templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

module.exports = angular
  .module('spinnaker.ecs', [
    require('./serverGroup/configure/wizard/CloneServerGroup.ecs.controller').name,
    SERVER_GROUP_DETAILS_MODULE,
    CLOUD_PROVIDER_REGISTRY,
    IAM_ROLE_READ_SERVICE,
    ECS_SERVER_GROUP_TRANSFORMER,
    // require('./pipeline/stages/cloneServerGroup/ecsCloneServerGroupStage').name,  // TODO(Bruno Carrier): We should enable this on Clouddriver before revealing this stage
    require('./serverGroup/configure/wizard/advancedSettings/advancedSettings.component').name,
    require('./serverGroup/configure/wizard/verticalScaling/verticalScaling.component').name,
    require('./serverGroup/configure/wizard/horizontalScaling/horizontalScaling.component').name,
    ECS_LOAD_BALANCER_SELECTOR,
    ECS_CLUSTER_READ_SERVICE,
    METRIC_ALARM_READ_SERVICE,
    PLACEMENT_STRATEGY_SERVICE,
    COMMON_MODULE,
    require('./serverGroup/configure/wizard/location/ServerGroupBasicSettings.controller').name,
    require('./serverGroup/configure/serverGroupCommandBuilder.service').name,
    require('./instance/details/instance.details.controller').name,
    require('./pipeline/stages/findImageFromTags/ecsFindImageFromTagStage').name,
    require('./pipeline/stages/destroyAsg/ecsDestroyAsgStage').name,
    require('./pipeline/stages/disableAsg/ecsDisableAsgStage').name,
    require('./pipeline/stages/disableCluster/ecsDisableClusterStage').name,
    require('./pipeline/stages/enableAsg/ecsEnableAsgStage').name,
    require('./pipeline/stages/resizeAsg/ecsResizeAsgStage').name,
    require('./pipeline/stages/scaleDownCluster/ecsScaleDownClusterStage').name,
    require('./pipeline/stages/shrinkCluster/ecsShrinkClusterStage').name,
  ])
  .config(function(cloudProviderRegistryProvider) {
    cloudProviderRegistryProvider.registerProvider('ecs', {
      name: 'EC2 Container Service',
      logo: { path: require('./logo/ecs.logo.svg') },
      serverGroup: {
        transformer: 'ecsServerGroupTransformer',
        detailsTemplateUrl: require('./serverGroup/details/serverGroupDetails.html'),
        detailsController: 'ecsServerGroupDetailsCtrl',
        cloneServerGroupTemplateUrl: require('./serverGroup/configure/wizard/serverGroupWizard.html'),
        cloneServerGroupController: 'ecsCloneServerGroupCtrl',
        commandBuilder: 'ecsServerGroupCommandBuilder',
        // configurationService: 'ecsServerGroupConfigurationService',
        scalingActivitiesEnabled: false,
      },
      instance: {
        detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
        detailsController: 'ecsInstanceDetailsCtrl',
      },
    });
  });

DeploymentStrategyRegistry.registerProvider('ecs', ['redblack']);
