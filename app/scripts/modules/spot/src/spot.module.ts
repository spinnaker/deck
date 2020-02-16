import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const SPOT_MODULE = 'spinnaker.spot';
module(SPOT_MODULE, []).config(function() {
  CloudProviderRegistry.registerProvider('spot', {
    name: 'Spot',
    logo: {
      path: require('./logo/spotinst-logo.png'),
    },
    applicationProviderFields: {
      templateUrl: require('./applicationProviderFields/spotFields.html'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('spot', []);
