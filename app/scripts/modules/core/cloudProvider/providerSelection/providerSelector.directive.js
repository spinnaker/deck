'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.providerSelection.directive', [
  require('../../account/account.service.js'),
  require('../../config/settings.js'),
  require('../../utils/lodash.js'),
])
  .directive('providerSelector', function(accountService, settings, _, $q) {
    return {
      restrict: 'E',
      scope: {
        component: '=',
        field: '@',
        readOnly: '=',
        providers: '=?',
      },
      templateUrl: require('./providerSelector.html'),
      link: function(scope) {
        scope.initialized = false;
        var getProviderList = scope.providers ? $q.when(scope.providers) : accountService.listProviders();
        getProviderList.then(function(providers) {
          scope.initialized = true;
          if (!providers.length) {
            scope.component[scope.field] = 'aws';
          }
          if (providers.length === 1) {
            scope.component[scope.field] = providers[0];
          }
          if (providers.length > 1) {
            scope.providers = providers;
            scope.showSelector = true;
          }

          scope.providerDisplayKeyMap = _.reduce(scope.providers, function(result, provider) {
            result[provider] = settings.providers[provider] && settings.providers[provider].humanFriendlyLabel ? settings.providers[provider].humanFriendlyLabel : provider;
            return result;
          }, {});

          scope.providers = _.map(scope.providers, function(provider) {
            return {
              provider: provider,
              label: scope.providerDisplayKeyMap[provider]
            };
          });
        });
      },
    };
  })
  .controller('ProviderSelectCtrl', function($scope, $modalInstance, settings, cloudProviderRegistry, providerOptions) {

    $scope.command = {
      provider: ''
    };

    $scope.getImage = function(provider) {
      return cloudProviderRegistry.getValue(provider, 'logo.path');
    };

    $scope.providerOptions = providerOptions;

    this.selectProvider = function() {
      $modalInstance.close($scope.command.provider);
    };

    this.cancel = $modalInstance.dismiss;

  }).name;
