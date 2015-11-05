'use strict';

global.Spinner = require('spin.js');

let angular = require('angular');

require('fonts/spinnaker/icons.css');

require('Select2');
require('jquery-ui');
// Must come after jquery-ui - we want the bootstrap tooltip, JavaScript is fun
require('bootstrap/dist/js/bootstrap.js');
require('bootstrap/dist/css/bootstrap.css');
require('select2-bootstrap-css/select2-bootstrap.css');
require('Select2/select2.css');
require('ui-select/dist/select.css');

require('angular-wizard/dist/angular-wizard.css');

require('source-sans-pro');

// load all templates into the $templateCache
var templates = require.context('./', true, /\.html$/);
templates.keys().forEach(templates);

module.exports = angular
  .module('spinnaker.core', [
    require('angular-animate'),
    require('angular-messages'),
    require('angular-sanitize'),
    require('angular-ui-router'),
    require('angular-ui-bootstrap'),
    require('exports?"angular.filter"!angular-filter'),
    require('exports?"infinite-scroll"!ng-infinite-scroll/build/ng-infinite-scroll.js'),
    require('exports?"restangular"!imports?_=lodash!restangular'),
    require('exports?"ui.select"!ui-select'),
    require('imports?define=>false!exports?"angularSpinner"!angular-spinner'),
    require('utils'),
    require('./account'),
    require('./application'),
    require('./applicationBootstrap'),
    require('./authentication'),
    require('./cache'),
    require('./ci'),
    require('./cloudProvider'),
    require('./cluster'),
    require('./config'),
    require('./confirmationModal'),
    require('./delivery'),
    require('./deploymentStrategy'),
    require('./diff'),
    require('./filterModel'),
    require('./forms'),
    require('./healthCounts'),
    require('./help'),
    require('./history'),
    require('./hotkeys'),
    require('./image'),
    require('./insight'),
    require('./instance'),
    require('./loadBalancer'),
    require('./modal'),
    require('./naming'),
    require('./navigation'),
    require('./network'),
    require('./notification'),
    require('./orchestratedItem'),
    require('./pageTitle'),
    require('./pipeline'),
    require('./presentation'),
    require('./projects'),
    require('./region'),
    require('./scheduler'),
    require('./search'),
    require('./securityGroup'),
    require('./serverGroup'),
    require('./task'),
    require('./templateOverride'),
    require('./validation'),
  ])
  .run(function($rootScope, $log, $state, settings) {

    $rootScope.feature = settings.feature;

    $rootScope.$state = $state; // TODO: Do we really need this?

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $log.debug(event.name, {
        event: event,
        toState: toState,
        toParams: toParams,
        fromState: fromState,
        fromParams: fromParams
      });
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      $log.debug(event.name, {
        event: event,
        toState: toState,
        toParams: toParams,
        fromState: fromState,
        fromParams: fromParams,
        error: error
      });
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $log.debug(event.name, {
        event: event,
        toState: toState,
        toParams: toParams,
        fromState: fromState,
        fromParams: fromParams
      });
    });
  })
  .run(function($templateCache) {
    $templateCache.put('template/popover/popover.html',
      '<div tooltip-animation-class="fade"' +
      '  uib-tooltip-classes' +
      '  ng-class="{ in: isOpen() }">' +
      '  <div class="arrow"></div>' +
      '  <div class="popover-inner">' +
      '      <h3 class="popover-title" ng-bind="title" ng-if="title"></h3>' +
      '      <div class="popover-content" ng-bind-html="content"></div>' +
      '  </div>' +
      '  </div>');
  })
  .config(function ($logProvider, statesProvider) {
    statesProvider.setStates();
    $logProvider.debugEnabled(true);
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
  .config(function(RestangularProvider, settings) {
    RestangularProvider.setBaseUrl(settings.gateUrl);
    RestangularProvider.setDefaultHttpFields({timeout: settings.pollSchedule * 2 + 5000}); // TODO: replace with apiHost call
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
  .config(require('./uiSelect.decorator.js'))
  .config(function(uiSelectConfig) {
    uiSelectConfig.theme = 'select2';
    uiSelectConfig.appendToBody = true;
  });
