'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.config', [
    require("./modules/core/apiHost"),
    require("./modules/core/featureFlags"),
    require("./modules/netflix/feedback/feedback.module.js"),
  ])
  .config(function(feedbackUrlProvider) {
    feedbackUrlProvider.set(__FEEDBACK_URL__);
  })
  .config(function(defaultTimeZoneProvider) {
    defaultTimeZoneProvider.set(__DEFAULT_TIME_ZONE__);
  })
  .config(function ($logProvider, statesProvider) {
    statesProvider.setStates();
    $logProvider.debugEnabled(true);
  })
  .config(function(featureFlagProvider) {
    featureFlagProvider.enable("pipelines");
    featureFlagProvider.disable("notifications");
    featureFlagProvider.set("canary", process.env.CANARY !== 'disabled');
    featureFlagProvider.enable("parallelPipelines");
    featureFlagProvider.enable("fastProperty");
    featureFlagProvider.enable("vpcMigrator");
    featureFlagProvider.enable("clusterDiff");
  })
  .config(function(apiHostProvider, RestangularProvider) {
    apiHostProvider.useHttps(__HTTPS_ENABLED__);
    apiHostProvider.setHost(__GATE_HOST__);
    apiHostProvider.setAuthEndpoint(__AUTH_ENDPOINT__);
    if (__AUTH__) {
      apiHostProvider.enableAuth();
    }
    RestangularProvider.setBaseUrl(
      apiHostProvider.baseUrl()
    );
  })
  //.config(function ($compileProvider) {
  //  $compileProvider.debugInfoEnabled(false);
  //})
  .config(function(uiSelectConfig) {
    uiSelectConfig.theme = 'select2';
    uiSelectConfig.appendToBody = true;
  })
  .config(function($uibTooltipProvider) {
    $uibTooltipProvider.options({
      appendToBody: true
    });
    $uibTooltipProvider.setTriggers({
      'mouseenter focus': 'mouseleave blur'
    });
  })
  .config(function($modalProvider) {
    $modalProvider.options.backdrop = 'static';
    $modalProvider.options.keyboard = false;
  })
  .config(function($httpProvider){
    $httpProvider.defaults.headers.patch = {
      'Content-Type': 'application/json;charset=utf-8'
    };
  })
  .config(function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|hipchat):/);
  })
  .config(function($animateProvider) {
    $animateProvider.classNameFilter(/animated/);
  })
  .config(require('./modules/core/forms/uiSelect.decorator.js'));
