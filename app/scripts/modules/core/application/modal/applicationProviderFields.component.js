'use strict';

import _ from 'lodash';
import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {SETTINGS} from 'core/config/settings';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.application.modal.applicationProviderFields.directive', [
    CLOUD_PROVIDER_REGISTRY,
  ])
  .component('applicationProviderFields', {
      templateUrl: require('./applicationProviderFields.component.html'),
      bindings: {
        application: '=',
        cloudProviders: '=',
      },
      controller: 'ApplicationProviderFieldsCtrl',
  })
  .controller('ApplicationProviderFieldsCtrl', function(cloudProviderRegistry) {
    const templateUrlPath = 'applicationProviderFields.templateUrl';
    let defaultProviderFields = SETTINGS.providers;

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

      return (candidateProvidersToShow || [])
        .filter(provider => cloudProviderRegistry.hasValue(provider, templateUrlPath))
        .map(provider => cloudProviderRegistry.getValue(provider, templateUrlPath));
    };
  });
