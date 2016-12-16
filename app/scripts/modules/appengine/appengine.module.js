import {module} from 'angular';

import {APPENGINE_CACHE_CONFIGURER} from './cache/cacheConfigurer.service';
import {APPENGINE_CLONE_SERVER_GROUP_CTRL} from './serverGroup/configure/wizard/cloneServerGroup.controller';
import {APPENGINE_HELP_CONTENTS_REGISTRY} from './helpContents/appengineHelpContents';
import {APPENGINE_INSTANCE_DETAILS_CTRL} from './instance/details/details.controller';
import {APPENGINE_LOAD_BALANCER_MODULE} from './loadBalancer/loadBalancer.module';
import {APPENGINE_SERVER_GROUP_BASIC_SETTINGS_CTRL} from './serverGroup/configure/wizard/basicSettings.controller';
import {APPENGINE_SERVER_GROUP_COMMAND_BUILDER} from './serverGroup/configure/serverGroupCommandBuilder.service';
import {APPENGINE_SERVER_GROUP_DETAILS_CONTROLLER} from './serverGroup/details/details.controller';
import {APPENGINE_SERVER_GROUP_TRANSFORMER} from './serverGroup/transformer';
import {CONDITIONAL_DESCRIPTION_LIST_ITEM} from './common/conditionalDescriptionListItem.component';

let templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const APPENGINE_MODULE = 'spinnaker.appengine';

module(APPENGINE_MODULE, [
    APPENGINE_CACHE_CONFIGURER,
    APPENGINE_CLONE_SERVER_GROUP_CTRL,
    APPENGINE_HELP_CONTENTS_REGISTRY,
    APPENGINE_INSTANCE_DETAILS_CTRL,
    APPENGINE_LOAD_BALANCER_MODULE,
    APPENGINE_SERVER_GROUP_BASIC_SETTINGS_CTRL,
    APPENGINE_SERVER_GROUP_COMMAND_BUILDER,
    APPENGINE_SERVER_GROUP_DETAILS_CONTROLLER,
    APPENGINE_SERVER_GROUP_TRANSFORMER,
    CONDITIONAL_DESCRIPTION_LIST_ITEM,
  ])
  .config((cloudProviderRegistryProvider) => {
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
      },
      loadBalancer: {
        transformer: 'appengineLoadBalancerTransformer',
        createLoadBalancerTemplateUrl: require('./loadBalancer/configure/wizard/wizard.html'),
        createLoadBalancerController: 'appengineLoadBalancerWizardCtrl',
        detailsTemplateUrl: require('./loadBalancer/details/details.html'),
        detailsController: 'appengineLoadBalancerDetailsCtrl',
      },
    });
  });
