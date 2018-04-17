import { module } from 'angular';

import { CLOUD_PROVIDER_REGISTRY, CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { APPENGINE_CACHE_CONFIGURER } from './cache/cacheConfigurer.service';
import { APPENGINE_COMPONENT_URL_DETAILS } from './common/componentUrlDetails.component';
import { APPENGINE_CONDITIONAL_DESCRIPTION_LIST_ITEM } from './common/conditionalDescriptionListItem.component';
import { APPENGINE_LOAD_BALANCER_CREATE_MESSAGE } from './common/loadBalancerMessage.component';
import './helpContents/appengineHelpContents';
import { APPENGINE_INSTANCE_DETAILS_CTRL } from './instance/details/details.controller';
import { APPENGINE_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { APPENGINE_PIPELINE_MODULE } from './pipeline/pipeline.module';
import { APPENGINE_SERVER_GROUP_COMMAND_BUILDER } from './serverGroup/configure/serverGroupCommandBuilder.service';
import { APPENGINE_SERVER_GROUP_BASIC_SETTINGS_CTRL } from './serverGroup/configure/wizard/basicSettings.controller';
import { APPENGINE_CLONE_SERVER_GROUP_CTRL } from './serverGroup/configure/wizard/cloneServerGroup.controller';
import { APPENGINE_SERVER_GROUP_DETAILS_CTRL } from './serverGroup/details/details.controller';
import { APPENGINE_SERVER_GROUP_TRANSFORMER } from './serverGroup/transformer';
import { APPENGINE_SERVER_GROUP_WRITER } from './serverGroup/writer/serverGroup.write.service';
import { APPENGINE_APPLICATION_NAME_VALIDATOR } from './validation/applicationName.validator';

import './logo/appengine.logo.less';

const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const APPENGINE_MODULE = 'spinnaker.appengine';

module(APPENGINE_MODULE, [
  APPENGINE_APPLICATION_NAME_VALIDATOR,
  APPENGINE_CACHE_CONFIGURER,
  APPENGINE_CLONE_SERVER_GROUP_CTRL,
  APPENGINE_COMPONENT_URL_DETAILS,
  APPENGINE_CONDITIONAL_DESCRIPTION_LIST_ITEM,
  APPENGINE_INSTANCE_DETAILS_CTRL,
  APPENGINE_LOAD_BALANCER_CREATE_MESSAGE,
  APPENGINE_LOAD_BALANCER_MODULE,
  APPENGINE_PIPELINE_MODULE,
  APPENGINE_SERVER_GROUP_BASIC_SETTINGS_CTRL,
  APPENGINE_SERVER_GROUP_COMMAND_BUILDER,
  APPENGINE_SERVER_GROUP_DETAILS_CTRL,
  APPENGINE_SERVER_GROUP_TRANSFORMER,
  APPENGINE_SERVER_GROUP_WRITER,
  CLOUD_PROVIDER_REGISTRY,
]).config((cloudProviderRegistryProvider: CloudProviderRegistry) => {
  cloudProviderRegistryProvider.registerProvider('appengine', {
    name: 'App Engine',
    cache: {
      configurer: 'appengineCacheConfigurer',
    },
    instance: {
      detailsTemplateUrl: require('./instance/details/details.html'),
      detailsController: 'appengineInstanceDetailsCtrl',
    },
    serverGroup: {
      transformer: 'appengineServerGroupTransformer',
      detailsController: 'appengineServerGroupDetailsCtrl',
      detailsTemplateUrl: require('./serverGroup/details/details.html'),
      commandBuilder: 'appengineServerGroupCommandBuilder',
      cloneServerGroupController: 'appengineCloneServerGroupCtrl',
      cloneServerGroupTemplateUrl: require('./serverGroup/configure/wizard/serverGroupWizard.html'),
      skipUpstreamStageCheck: true,
    },
    loadBalancer: {
      transformer: 'appengineLoadBalancerTransformer',
      createLoadBalancerTemplateUrl: require('./loadBalancer/configure/wizard/wizard.html'),
      createLoadBalancerController: 'appengineLoadBalancerWizardCtrl',
      detailsTemplateUrl: require('./loadBalancer/details/details.html'),
      detailsController: 'appengineLoadBalancerDetailsCtrl',
    },
    logo: {
      path: require('./logo/appengine.logo.svg'),
    },
  });
});

DeploymentStrategyRegistry.registerProvider('appengine', ['custom']);
