import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { SpotServerGroupTransformer } from './serverGroup/serverGroup.transformer';
import './logo/spot.logo.less';
import { COMMON_MODULE } from './common/common.module';

import { SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER } from './serverGroup/details/serverGroupDetails.spot.controller';
import { SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER } from './serverGroup/details/resize/resizeServerGroup.controller';

const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const SPOT_MODULE = 'spinnaker.spot';
module(SPOT_MODULE, [
  COMMON_MODULE,
  // Server Groups
  SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER,
  SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER,
]).config(function() {
  CloudProviderRegistry.registerProvider('spot', {
    name: 'Spot',
    logo: {
      path: require('./logo/spotinst-logo.icon.svg'),
    },
    serverGroup: {
      transformer: SpotServerGroupTransformer,
      detailsTemplateUrl: require('./serverGroup/details/serverGroupDetails.html'),
      detailsController: 'spotServerGroupDetailsCtrl',
    },
    applicationProviderFields: {
      templateUrl: require('./applicationProviderFields/spotFields.html'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('spot', []);
