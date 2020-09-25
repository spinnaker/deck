import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { AWS_FUNCTION_MODULE } from './function/function.module';
import { AWS_REACT_MODULE } from './reactShims/aws.react.module';
import { AWS_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { AWS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/amazon.help';

import { AwsImageReader } from './image';
import { AmazonLoadBalancerClusterContainer } from './loadBalancer/AmazonLoadBalancerClusterContainer';
import { AmazonLoadBalancersTag } from './loadBalancer/AmazonLoadBalancersTag';
import { AwsLoadBalancerTransformer } from './loadBalancer/loadBalancer.transformer';
import { AwsFunctionTransformer } from './function/function.transformer';
import './deploymentStrategy/rollingPush.strategy';

import amazonLogo from './logo/amazon.logo.svg';
import './logo/aws.logo.less';

import { AmazonCloneServerGroupModal } from './serverGroup/configure/wizard/AmazonCloneServerGroupModal';
import { AmazonLoadBalancerChoiceModal } from './loadBalancer/configure/AmazonLoadBalancerChoiceModal';

import { AmazonServerGroupActions } from './serverGroup/details/AmazonServerGroupActions';
import { amazonServerGroupDetailsGetter } from './serverGroup/details/amazonServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  AmazonInfoDetailsSection,
  AmazonCapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LaunchTemplateDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';

import { DEPLOY_CLOUDFORMATION_STACK_STAGE } from './pipeline/stages/deployCloudFormation/deployCloudFormationStackStage';
import { CLOUDFORMATION_TEMPLATE_ENTRY } from './pipeline/stages/deployCloudFormation/cloudFormationTemplateEntry.component';
import { CLOUD_FORMATION_CHANGE_SET_INFO } from './pipeline/stages/deployCloudFormation/CloudFormationChangeSetInfo';
import { CreateLambdaFunction } from './function/CreateLambdaFunction';
import { AmazonFunctionDetails } from './function';
import { AMAZON_PIPELINE_STAGES_BAKE_AWSBAKESTAGE } from './pipeline/stages/bake/awsBakeStage';
import { AMAZON_PIPELINE_STAGES_CLONESERVERGROUP_AWSCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/awsCloneServerGroupStage';
import { AMAZON_PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE } from './pipeline/stages/destroyAsg/awsDestroyAsgStage';
import { AMAZON_PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE } from './pipeline/stages/disableAsg/awsDisableAsgStage';
import { AMAZON_PIPELINE_STAGES_DISABLECLUSTER_AWSDISABLECLUSTERSTAGE } from './pipeline/stages/disableCluster/awsDisableClusterStage';
import { AMAZON_PIPELINE_STAGES_ROLLBACKCLUSTER_AWSROLLBACKCLUSTERSTAGE } from './pipeline/stages/rollbackCluster/awsRollbackClusterStage';
import { AMAZON_PIPELINE_STAGES_ENABLEASG_AWSENABLEASGSTAGE } from './pipeline/stages/enableAsg/awsEnableAsgStage';
import { AMAZON_PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE } from './pipeline/stages/findAmi/awsFindAmiStage';
import { AMAZON_PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE } from './pipeline/stages/findImageFromTags/awsFindImageFromTagsStage';
import { AMAZON_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE } from './pipeline/stages/modifyScalingProcess/modifyScalingProcessStage';
import { AMAZON_PIPELINE_STAGES_RESIZEASG_AWSRESIZEASGSTAGE } from './pipeline/stages/resizeAsg/awsResizeAsgStage';
import { AMAZON_PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE } from './pipeline/stages/scaleDownCluster/awsScaleDownClusterStage';
import { AMAZON_PIPELINE_STAGES_SHRINKCLUSTER_AWSSHRINKCLUSTERSTAGE } from './pipeline/stages/shrinkCluster/awsShrinkClusterStage';
import { AMAZON_PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE } from './pipeline/stages/tagImage/awsTagImageStage';
import { AMAZON_INSTANCE_AWSINSTANCETYPE_SERVICE } from './instance/awsInstanceType.service';
import { AMAZON_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER } from './instance/details/instance.details.controller';
import { AMAZON_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { AWS_EVALUATE_CLOUD_FORMATION_CHANGE_SET_EXECUTION_SERVICE } from './pipeline/stages/deployCloudFormation/evaluateCloudFormationChangeSetExecution.service';
import { INSTANCE_STATUS_COMPONENT } from './instance/details/instanceStatus.component';
import { AMAZON_INSTANCE_INFORMATION_COMPONENT } from './instance/details/amazonInstanceInformation.component';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const AMAZON_MODULE = 'spinnaker.amazon';
module(AMAZON_MODULE, [
  AWS_REACT_MODULE,
  AMAZON_PIPELINE_STAGES_BAKE_AWSBAKESTAGE,
  AMAZON_PIPELINE_STAGES_CLONESERVERGROUP_AWSCLONESERVERGROUPSTAGE,
  AMAZON_PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE,
  AMAZON_PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE,
  AMAZON_PIPELINE_STAGES_DISABLECLUSTER_AWSDISABLECLUSTERSTAGE,
  AMAZON_PIPELINE_STAGES_ROLLBACKCLUSTER_AWSROLLBACKCLUSTERSTAGE,
  AMAZON_PIPELINE_STAGES_ENABLEASG_AWSENABLEASGSTAGE,
  AMAZON_PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE,
  AMAZON_PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE,
  AMAZON_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE,
  AMAZON_PIPELINE_STAGES_RESIZEASG_AWSRESIZEASGSTAGE,
  AMAZON_PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE,
  AMAZON_PIPELINE_STAGES_SHRINKCLUSTER_AWSSHRINKCLUSTERSTAGE,
  AMAZON_PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  AWS_SERVER_GROUP_TRANSFORMER,
  AMAZON_INSTANCE_AWSINSTANCETYPE_SERVICE,
  AWS_LOAD_BALANCER_MODULE,
  AWS_FUNCTION_MODULE,
  AMAZON_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER,
  AWS_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  AMAZON_SEARCH_SEARCHRESULTFORMATTER,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
  CLOUD_FORMATION_CHANGE_SET_INFO,
  AWS_EVALUATE_CLOUD_FORMATION_CHANGE_SET_EXECUTION_SERVICE,
  INSTANCE_STATUS_COMPONENT,
  AMAZON_INSTANCE_INFORMATION_COMPONENT,
]).config(() => {
  CloudProviderRegistry.registerProvider('aws', {
    name: 'Amazon',
    logo: {
      path: amazonLogo,
    },
    image: {
      reader: AwsImageReader,
    },
    serverGroup: {
      transformer: 'awsServerGroupTransformer',
      detailsActions: AmazonServerGroupActions,
      detailsGetter: amazonServerGroupDetailsGetter,
      detailsSections: [
        AmazonInfoDetailsSection,
        AmazonCapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        LaunchTemplateDetailsSection,
        SecurityGroupsDetailsSection,
        ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: AmazonCloneServerGroupModal,
      commandBuilder: 'awsServerGroupCommandBuilder',
      configurationService: 'awsServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'awsInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'awsInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: AwsLoadBalancerTransformer,
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'awsLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: AmazonLoadBalancerChoiceModal,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'awsTargetGroupDetailsCtrl',
      ClusterContainer: AmazonLoadBalancerClusterContainer,
      LoadBalancersTag: AmazonLoadBalancersTag,
    },
    function: {
      details: AmazonFunctionDetails,
      CreateFunctionModal: CreateLambdaFunction,
      transformer: AwsFunctionTransformer,
    },
    securityGroup: {
      transformer: 'awsSecurityGroupTransformer',
      reader: 'awsSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'awsSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'awsCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'awsSubnetRenderer',
    },
    search: {
      resultFormatter: 'awsSearchResultFormatter',
    },
    applicationProviderFields: {
      templateUrl: require('./applicationProviderFields/awsFields.html'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('aws', [
  'custom',
  'redblack',
  'rollingpush',
  'rollingredblack',
  'monitored',
]);
