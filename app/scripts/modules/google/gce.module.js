'use strict';

let angular = require('angular');

require('./logo/gce.logo.less');

module.exports = angular.module('spinnaker.gce', [
  require('../core/cloudProvider/cloudProvider.registry.js'),
  require('./serverGroup/details/serverGroupDetails.gce.controller.js'),
  require('./serverGroup/configure/ServerGroupCommandBuilder.js'),
  require('./serverGroup/configure/wizard/CloneServerGroupCtrl.js'),
  require('./serverGroup/configure/serverGroup.configure.gce.module.js'),
  require('./serverGroup/serverGroup.transformer.js'),
  require('../core/network/network.module.js'),
  require('../core/pipeline/config/stages/bake/docker/dockerBakeStage.js'),
  require('../core/pipeline/config/stages/bake/gce/gceBakeStage.js'),
  require('../core/pipeline/config/stages/destroyAsg/gce/gceDestroyAsgStage.js'),
  require('../core/pipeline/config/stages/enableAsg/gce/gceEnableAsgStage.js'),
  require('../core/pipeline/config/stages/disableAsg/gce/gceDisableAsgStage.js'),
  require('../core/pipeline/config/stages/resizeAsg/gce/gceResizeAsgStage.js'),
  require('./instance/gceInstanceTypeService.js'),
  require('./loadBalancer/loadBalancer.transformer.js'),
  require('./loadBalancer/details/LoadBalancerDetailsCtrl.js'),
  require('./loadBalancer/configure/CreateLoadBalancerCtrl.js'),
  require('./instance/details/instance.details.controller.js'),
  require('./securityGroup/details/SecurityGroupDetailsCtrl.js'),
  require('./securityGroup/configure/CreateSecurityGroupCtrl.js'),
  require('./securityGroup/configure/EditSecurityGroupCtrl.js'),
  require('./securityGroup/securityGroup.transformer.js'),
  require('./securityGroup/securityGroup.reader.js'),
  require('./image/image.reader.js'),
  require('./cache/cacheConfigurer.service.js'),
])
  .config(function(cloudProviderRegistryProvider) {
    cloudProviderRegistryProvider.registerProvider('gce', {
      logo: {
        path: require('./logo/gce.logo.png'),
      },
      cache: {
        configurer: 'gceCacheConfigurer',
      },
      image: {
        reader: 'gceImageReader',
      },
      serverGroup: {
        transformer: 'gceServerGroupTransformer',
        detailsTemplateUrl: require('./serverGroup/details/serverGroupDetails.html'),
        detailsController: 'gceServerGroupDetailsCtrl',
        cloneServerGroupTemplateUrl: require('./serverGroup/configure/wizard/serverGroupWizard.html'),
        cloneServerGroupController: 'gceCloneServerGroupCtrl',
        commandBuilder: 'gceServerGroupCommandBuilder',
        configurationService: 'gceServerGroupConfigurationService',
      },
      instance: {
        instanceTypeService: 'gceInstanceTypeService',
        detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
        detailsController: 'gceInstanceDetailsCtrl',
      },
      loadBalancer: {
        transformer: 'gceLoadBalancerTransformer',
        detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
        detailsController: 'gceLoadBalancerDetailsCtrl',
        createLoadBalancerTemplateUrl: require('./loadBalancer/configure/createLoadBalancer.html'),
        createLoadBalancerController: 'gceCreateLoadBalancerCtrl',
      },
      securityGroup: {
        transformer: 'gceSecurityGroupTransformer',
        reader: 'gceSecurityGroupReader',
        detailsTemplateUrl: require('./securityGroup/details/securityGroupDetails.html'),
        detailsController: 'gceSecurityGroupDetailsCtrl',
        createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
        createSecurityGroupController: 'gceCreateSecurityGroupCtrl',
      },
    });
  });

