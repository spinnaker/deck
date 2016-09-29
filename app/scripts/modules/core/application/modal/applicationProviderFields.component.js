'use strict';

import _ from 'lodash';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.application.modal.applicationProviderFields.directive', [
    require('../../cloudProvider/cloudProvider.registry.js'),
    require('../../config/settings.js'),
  ])
  .component('applicationProviderFields', {
      templateUrl: require('./applicationProviderFields.component.html'),
      bindings: {
        application: '=',
        cloudProviders: '=',
      },
      controller: 'ApplicationProviderFieldsCtrl',
  })
  .controller('ApplicationProviderFieldsCtrl', function(cloudProviderRegistry, settings) {
    const templateUrlPath = 'applicationProviderFields.templateUrl';
    let defaultProviderFields = settings.providers;

    this.initializeApplicationField = (fieldPath) => {
      let applicationFieldPath = 'providerSettings.' + fieldPath;

      if (_.has(defaultProviderFields, fieldPath) && !_.has(this.application, applicationFieldPath)) {
        _.set(this.application, applicationFieldPath, _.get(defaultProviderFields, fieldPath));
      }
    };

    this.getRelevantProviderFieldsTemplates = () => {
      let candidateProvidersToShow,
        appCloudProviders = this.application.cloudProviders;

      if (appCloudProviders.length === 0) {
        candidateProvidersToShow = this.cloudProviders;
      } else {
        candidateProvidersToShow = _.isString(appCloudProviders)
          ? appCloudProviders.split(',')
          : appCloudProviders;
      }

      return candidateProvidersToShow
        .filter(provider => cloudProviderRegistry.hasValue(provider, templateUrlPath))
        .map(provider => cloudProviderRegistry.getValue(provider, templateUrlPath));
    };
  });
