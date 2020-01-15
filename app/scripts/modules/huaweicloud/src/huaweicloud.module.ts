'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { BAKE_STAGE } from './pipeline/stages/bake/huaweicloudBakeStage';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const HUAWEICLOUD_MODULE = 'spinnaker.huaweicloud';
module(HUAWEICLOUD_MODULE, [BAKE_STAGE]).config(() => {
  CloudProviderRegistry.registerProvider('huaweicloud', {
    name: 'huaweicloud',
  });
});

DeploymentStrategyRegistry.registerProvider('huaweicloud', ['redblack']);
