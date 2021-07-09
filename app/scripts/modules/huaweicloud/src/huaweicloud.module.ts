'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { BAKE_STAGE } from './pipeline/stages/bake/huaweicloudBakeStage';

export const HUAWEICLOUD_MODULE = 'spinnaker.huaweicloud';
module(HUAWEICLOUD_MODULE, [BAKE_STAGE]).config(() => {
  CloudProviderRegistry.registerProvider('huaweicloud', {
    name: 'huaweicloud',
  });
});

DeploymentStrategyRegistry.registerProvider('huaweicloud', ['redblack']);
