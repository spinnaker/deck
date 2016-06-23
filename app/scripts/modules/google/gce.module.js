'use strict';

let angular = require('angular');

require('./logo/gce.logo.less');

// load all templates into the $templateCache
var templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

module.exports = angular.module('spinnaker.gce', [
  require('../core/cloudProvider/cloudProvider.registry.js'),
  require('./serverGroup/details/serverGroup.details.gce.module.js'),
  require('./serverGroup/configure/serverGroupCommandBuilder.service.js'),
  require('./serverGroup/configure/wizard/cloneServerGroup.gce.controller.js'),
  require('./serverGroup/configure/serverGroup.configure.gce.module.js'),
  require('./serverGroup/serverGroup.transformer.js'),
  require('../core/network/network.module.js'),
  require('../core/pipeline/config/stages/bake/docker/dockerBakeStage.js'),
  require('../core/pipeline/config/stages/bake/gce/gceBakeStage.js'),
  require('../core/pipeline/config/stages/destroyAsg/gce/gceDestroyAsgStage.js'),
  require('../core/pipeline/config/stages/disableAsg/gce/gceDisableAsgStage.js'),
  require('../core/pipeline/config/stages/disableCluster/gce/gceDisableClusterStage.js'),
  require('../core/pipeline/config/stages/enableAsg/gce/gceEnableAsgStage.js'),
  require('../core/pipeline/config/stages/findAmi/gce/gceFindAmiStage.js'),
  require('../core/pipeline/config/stages/resizeAsg/gce/gceResizeAsgStage.js'),
  require('../core/pipeline/config/stages/scaleDownCluster/gce/gceScaleDownClusterStage.js'),
  require('../core/pipeline/config/stages/shrinkCluster/gce/gceShrinkClusterStage.js'),
  require('./instance/gceInstanceType.service.js'),
  require('./instance/gceMultiInstanceTask.transformer.js'),
  require('./instance/custom/customInstance.filter.js'),
  require('./loadBalancer/loadBalancer.transformer.js'),
  require('./loadBalancer/details/loadBalancerDetail.controller.js'),
  require('./loadBalancer/configure/createLoadBalancer.controller.js'),
  require('./instance/details/instance.details.controller.js'),
  require('./securityGroup/details/securityGroupDetail.controller.js'),
  require('./securityGroup/configure/createSecurityGroup.controller.js'),
  require('./securityGroup/configure/editSecurityGroup.controller.js'),
  require('./securityGroup/securityGroup.transformer.js'),
  require('./securityGroup/securityGroup.reader.js'),
  require('./subnet/subnet.renderer.js'),
  require('./validation/applicationName.validator.js'),
  require('./image/image.reader.js'),
  require('./cache/cacheConfigurer.service.js'),
])
  .config(function(cloudProviderRegistryProvider) {
    cloudProviderRegistryProvider.registerProvider('gce', {
      name: 'Google',
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
        multiInstanceTaskTransformer: 'gceMultiInstanceTaskTransformer',
        customInstanceBuilderTemplateUrl: require('./serverGroup/configure/wizard/customInstance/customInstanceBuilder.html'),
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
        detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
        detailsController: 'gceSecurityGroupDetailsCtrl',
        createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
        createSecurityGroupController: 'gceCreateSecurityGroupCtrl',
      },
      subnet: {
        renderer: 'gceSubnetRenderer',
      },
    });
  });

