'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { ALICLOUD_LOADBALANCER_BALANCER } from './loadBalancer/loadBalancer.transformer';
import { ALICLOUD_LOADBALANCER_DETAILS } from './loadBalancer/details/loadBalancerDetail.controller';
import { ALICLOUD_LOADBALANCER_CREATE } from './loadBalancer/configure/createLoadBalancer.controller';
import { ALICLOUD_SERVERGROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import { ALICLOUD_SERVERGROUP_CONFIGURE } from './serverGroup/configure/serverGroup.configure.alicloud.module';
import { ALICLOUD_SERVERGROUP_DETAILS } from './serverGroup/details/serverGroup.details.module';
// import { ALICLOUD_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
// import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
// import { AlicloudServerGroupActions } from './serverGroup/details/AlicloudServerGroupActions';
// import { alicloudServerGroupDetailsGetter } from './serverGroup/details/alicloudServerGroupDetailsGetter';
import { ALICLOUD_CLONESERVERGROUPCTRL } from './serverGroup/configure/wizard/CloneServerGroup.alicloud.controller';
import { CloneServerGroupAlicloud } from './serverGroup/configure/wizard/CloneServerGroup.alicloud';
import { ALICLOUD_INSTANCE_SERVICE } from './instance/alicloudInstanceType.service';
import { ALICLOUD_INSTANCE_DETAILCTRL } from './instance/details/instance.details.controller';
import { ALICLOU_VALIDATION } from './validation/applicationName.validator';
import { ALICLOUD_IMAGE } from './image/image.reader';
import { ALICLOUD_SECURITY_TRANSFORMER } from './securityGroup/securityGroup.transformer';
import { ALICLOUD_SECURITY_READER } from './securityGroup/securityGroup.reader';
import { ALICLOUD_SECURITY_WRITE_SERVICE } from './securityGroup/securityGroup.write.service';
import { ALICLOUD_SECURITY_DETAILCTRL } from './securityGroup/details/securityGroupDetail.controller';
import { ALICLOUD_SECURITY_CREATECTRL } from './securityGroup/configure/CreateSecurityGroupCtrl';
import { ALICLOUD_SECURITY_EDITCTRL } from './securityGroup/configure/EditSecurityGroupCtrl';
import './help/alicloud.help';
import './logo/alicloud.logo.less';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const ALICLOUD_MODULE = 'spinnaker.alicloud';
module(ALICLOUD_MODULE, [
  require('./pipeline/stages/destroyAsg/alicloudDestroyAsgStage').name,
  require('./pipeline/stages/enableAsg/alicloudEnableAsgStage').name,
  require('./pipeline/stages/disableAsg/alicloudDisableAsgStage').name,
  require('./pipeline/stages/bake/alicloudBakeStage').name,
  require('./pipeline/stages/findAmi/alicloudFindAmiStage').name,
  require('./pipeline/stages/scaleDownCluster/alicloudScaleDownClusterStage').name,
  require('./pipeline/stages/destroyAsg/alicloudDestroyAsgStage').name,
  require('./pipeline/stages/rollbackCluster/alicloudRollbackClusterStage').name,
  require('./pipeline/stages/resizeAsg/alicloudResizeAsgStage').name,
  require('./pipeline/stages/findImageFromTags/alicloudFindImageFromTagsStage').name,
  require('./pipeline/stages/disableCluster/alicloudDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/alicloudRollbackClusterStage').name,
  require('./pipeline/stages/cloneServerGroup/alicloudCloneServerGroupStage').name,

  ALICLOUD_SECURITY_READER,
  ALICLOUD_SECURITY_TRANSFORMER,
  ALICLOUD_SECURITY_DETAILCTRL,
  ALICLOUD_SECURITY_CREATECTRL,
  ALICLOUD_SECURITY_EDITCTRL,
  ALICLOUD_SECURITY_WRITE_SERVICE,

  ALICLOUD_SERVERGROUP_DETAILS,
  ALICLOUD_SERVERGROUP_TRANSFORMER,
  ALICLOUD_CLONESERVERGROUPCTRL,
  ALICLOUD_SERVERGROUP_CONFIGURE,

  ALICLOUD_INSTANCE_SERVICE,
  ALICLOUD_INSTANCE_DETAILCTRL,

  ALICLOUD_LOADBALANCER_BALANCER,
  ALICLOUD_LOADBALANCER_DETAILS,
  ALICLOUD_LOADBALANCER_CREATE,

  ALICLOUD_IMAGE,
  ALICLOU_VALIDATION,
]).config(function() {
  CloudProviderRegistry.registerProvider('alicloud', {
    name: 'AlibabaCloud',
    logo: {
      path: require('./logo/alicloud.png'),
    },
    image: {
      reader: 'alicloudImageReader',
    },
    serverGroup: {
      transformer: 'alicloudServerGroupTransformer',
      detailsTemplateUrl: require('./serverGroup/details/serverGroupDetails.html'),
      detailsController: 'alicloudServerGroupDetailsCtrl',
      // CloneServerGroupModal: CloneServerGroupAlicloud,
      cloneServerGroupTemplateUrl: require('./serverGroup/configure/wizard/serverGroupWizard.html'),
      cloneServerGroupController: 'alicloudCloneServerGroupCtrl',
      commandBuilder: 'alicloudServerGroupCommandBuilder',
      configurationService: 'alicloudServerGroupConfigurationService',
    },
    instance: {
      instanceTypeService: 'alicloudInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'alicloudInstanceDetailsCtrl',
    },
    securityGroup: {
      transformer: 'alicloudSecurityGroupTransformer',
      writer: 'alicloudSecurityGroupWriter',
      reader: 'alicloudSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'alicloudSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'alicloudCreateSecurityGroupCtrl',
    },
    loadBalancer: {
      transformer: 'alicloudLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetail.html'),
      detailsController: 'alicloudLoadBalancerDetailsCtrl',
      createLoadBalancerTemplateUrl: require('./loadBalancer/configure/createLoadBalancer.html'),
      createLoadBalancerController: 'alicloudCreateLoadBalancerCtrl',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('alicloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
