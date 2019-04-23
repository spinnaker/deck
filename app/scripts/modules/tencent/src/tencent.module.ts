import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { TENCENT_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TENCENT_REACT_MODULE } from './reactShims/tencent.react.module';
import { TENCENT_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { TENCENT_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/tencent.help';

import { TencentImageReader } from './image';
import { TencentLoadBalancerClusterContainer } from './loadBalancer/TencentLoadBalancerClusterContainer';
import { TencentLoadBalancersTag } from './loadBalancer/TencentLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/tencent.logo.less';
import { TencentCloneServerGroupModal } from './serverGroup/configure/wizard/TencentCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { TencentServerGroupActions } from './serverGroup/details/TencentServerGroupActions';
import { tencentServerGroupDetailsGetter } from './serverGroup/details/tencentServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  TencentInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  // ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';

import { DEPLOY_CLOUDFORMATION_STACK_STAGE } from './pipeline/stages/deployCloudFormation/deployCloudFormationStackStage';
import { CLOUDFORMATION_TEMPLATE_ENTRY } from './pipeline/stages/deployCloudFormation/cloudFormationTemplateEntry.component';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENT_MODULE = 'spinnaker.tencent';
module(TENCENT_MODULE, [
  TENCENT_REACT_MODULE,
  require('./pipeline/stages/bake/tencentBakeStage').name,
  require('./pipeline/stages/cloneServerGroup/tencentCloneServerGroupStage').name,
  require('./pipeline/stages/destroyAsg/tencentDestroyAsgStage').name,
  require('./pipeline/stages/disableAsg/tencentDisableAsgStage').name,
  require('./pipeline/stages/disableCluster/tencentDisableClusterStage').name,
  require('./pipeline/stages/rollbackCluster/tencentRollbackClusterStage').name,
  require('./pipeline/stages/enableAsg/tencentEnableAsgStage').name,
  require('./pipeline/stages/findAmi/tencentFindAmiStage').name,
  require('./pipeline/stages/findImageFromTags/tencentFindImageFromTagsStage').name,
  require('./pipeline/stages/modifyScalingProcess/modifyScalingProcessStage').name,
  require('./pipeline/stages/resizeAsg/tencentResizeAsgStage').name,
  require('./pipeline/stages/scaleDownCluster/tencentScaleDownClusterStage').name,
  require('./pipeline/stages/shrinkCluster/tencentShrinkClusterStage').name,
  require('./pipeline/stages/tagImage/tencentTagImageStage').name,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  TENCENT_SERVER_GROUP_TRANSFORMER,
  require('./instance/tencentInstanceType.service').name,
  TENCENT_LOAD_BALANCER_MODULE,
  require('./instance/details/instance.details.controller').name,
  TENCENT_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  require('./search/searchResultFormatter').name,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencent', {
    name: 'Tencent',
    logo: {
      path: require('./logo/tencent.logo.svg'),
    },
    image: {
      reader: TencentImageReader,
    },
    serverGroup: {
      transformer: 'tencentServerGroupTransformer',
      detailsActions: TencentServerGroupActions,
      detailsGetter: tencentServerGroupDetailsGetter,
      detailsSections: [
        TencentInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        // ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: TencentCloneServerGroupModal,
      commandBuilder: 'tencentServerGroupCommandBuilder',
      configurationService: 'tencentServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'tencentInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'tencentInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'tencentLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'tencentLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'tencentTargetGroupDetailsCtrl',
      ClusterContainer: TencentLoadBalancerClusterContainer,
      LoadBalancersTag: TencentLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'tencentSecurityGroupTransformer',
      reader: 'tencentSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'tencentSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'tencentCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'tencentSubnetRenderer',
    },
    search: {
      resultFormatter: 'tencentSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencent', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
