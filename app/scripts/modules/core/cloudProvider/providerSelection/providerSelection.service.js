'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.providerSelection.service', [
  require('../../account/account.service.js'),
  require('../../config/settings.js'),
  require('../cloudProvider.registry.js'),
])
  .factory('providerSelectionService', function($uibModal, $q, accountService, settings, cloudProviderRegistry) {
    function selectProvider(application, feature) {
      return accountService.listProviders(application).then((providers) => {

        let provider;
        let reducedProviders = [];
        if (feature) {
          reducedProviders = providers.filter((provider) => cloudProviderRegistry.hasValue(provider, feature));
        }

        // reduce the providers the smallest, unique collection taking into consideration the useProvider values
        reducedProviders = [...new Set(reducedProviders.map((_provider) => {
          let result = _provider;
          const providerFeature = cloudProviderRegistry.getProvider(_provider)[feature];
          if (providerFeature) {
            result = providerFeature.useProvider || _provider;
          }

          return result;
        }))];

        if (reducedProviders.length > 1) {
          provider = $uibModal.open({
            templateUrl: require('./providerSelection.html'),
            controller: 'ProviderSelectCtrl as ctrl',
            resolve: {
              providerOptions: function() { return reducedProviders; }
            }
          }).result;
        } else if (reducedProviders.length === 1) {
          provider = $q.when(reducedProviders[0]);
        } else {
          provider = $q.when(settings.defaultProvider || 'aws');
        }
        return provider;
      });
    }

    return {
      selectProvider: selectProvider,
    };
  });
