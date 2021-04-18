import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { SpotServerGroupTransformer } from './serverGroup/serverGroup.transformer';
import './logo/spot.logo.less';
import { COMMON_MODULE } from './common/common.module';
import { SPOT_PIPELINE_STAGES_CLONESERVERGROUP_SPOTCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/spotCloneServerGroupStage';
import { SPOT_PIPELINE_STAGES_CREATESERVERGROUP_SPOTCREATESERVERGROUPSTAGE } from './pipeline/stages/createServerGroup/spotCreateServerGroupStage';
import { SPOT_PIPELINE_STAGES_DISABLE_SERVER_GROUP_STAGE } from './pipeline/stages/disableServerGroup/spotDisableServerGroupStage';
import { SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER } from './serverGroup/details/serverGroupDetails.spot.controller';
import { SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER } from './serverGroup/details/resize/resizeServerGroup.controller';
import { SPOT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER } from './instance/details/instance.details.controller';
import { SPOT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_SPOTFINDIMAGEFROMTAGSSTAGE } from './pipeline/stages/findImageFromTags/spotFindImageFromTagsStage';

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
  SPOT_PIPELINE_STAGES_CLONESERVERGROUP_SPOTCLONESERVERGROUPSTAGE,
  SPOT_PIPELINE_STAGES_CREATESERVERGROUP_SPOTCREATESERVERGROUPSTAGE,
  SPOT_PIPELINE_STAGES_DISABLE_SERVER_GROUP_STAGE,
  SPOT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER,
  SPOT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_SPOTFINDIMAGEFROMTAGSSTAGE,
]).config(function() {
  CloudProviderRegistry.registerProvider('spot', {
    name: 'Spot',
    logo: {
      path: require('./logo/spotLogo.svg'),
    },
    serverGroup: {
      transformer: SpotServerGroupTransformer,
      detailsTemplateUrl: require('./serverGroup/details/serverGroupDetails.html'),
      detailsController: 'spotServerGroupDetailsCtrl',
    },
    instance: {
      detailsController: 'spotInstanceDetailsCtrl',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('spot', []);
