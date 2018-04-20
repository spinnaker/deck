'use strict';

const angular = require('angular');

import { ACCOUNT_SERVICE } from 'core/account/account.service';
import { CloudProviderRegistry } from 'core/cloudProvider';

import './providerSelection.modal.less';

module.exports = angular
  .module('spinnaker.providerSelection.directive', [ACCOUNT_SERVICE])
  .directive('providerSelector', function(accountService, $q) {
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
        var getProviderList = scope.providers ? $q.when(scope.providers.sort()) : accountService.listProviders();
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
        });
      },
    };
  })
  .controller('ProviderSelectCtrl', function($scope, $uibModalInstance, providerOptions) {
    $scope.command = {
      provider: '',
    };

    $scope.getImage = function(provider) {
      return CloudProviderRegistry.getValue(provider, 'logo.path');
    };

    $scope.providerOptions = providerOptions;

    this.selectProvider = function() {
      $uibModalInstance.close($scope.command.provider);
    };

    this.cancel = $uibModalInstance.dismiss;
  });
