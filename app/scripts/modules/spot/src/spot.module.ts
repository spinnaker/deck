import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { SpotServerGroupTransformer } from './serverGroup/serverGroup.transformer';

import { SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER } from './serverGroup/details/serverGroupDetails.controller';

const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const SPOT_MODULE = 'spinnaker.spot';
module(SPOT_MODULE, [
  // Server Groups
  SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER,
]).config(function() {
  CloudProviderRegistry.registerProvider('spot', {
    name: 'Spot',
    logo: {
      path: require('./logo/spotinst-logo.png'),
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
