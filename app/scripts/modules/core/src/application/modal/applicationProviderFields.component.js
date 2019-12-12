'use strict';

import _ from 'lodash';
import { CloudProviderRegistry } from 'core/cloudProvider';
import { SETTINGS } from 'core/config/settings';

import { module } from 'angular';

export const CORE_APPLICATION_MODAL_APPLICATIONPROVIDERFIELDS_COMPONENT =
  'spinnaker.core.application.modal.applicationProviderFields.directive';
export const name = CORE_APPLICATION_MODAL_APPLICATIONPROVIDERFIELDS_COMPONENT; // for backwards compatibility
module(CORE_APPLICATION_MODAL_APPLICATIONPROVIDERFIELDS_COMPONENT, [])
  .component('applicationProviderFields', {
    templateUrl: require('./applicationProviderFields.component.html'),
    bindings: {
      application: '=',
      cloudProviders: '=',
    },
    controller: 'ApplicationProviderFieldsCtrl',
  })
  .controller('ApplicationProviderFieldsCtrl', function() {
    const templateUrlPath = 'applicationProviderFields.templateUrl';
    let defaultProviderFields = SETTINGS.providers;

    this.initializeApplicationField = fieldPath => {
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
        candidateProvidersToShow = _.isString(appCloudProviders) ? appCloudProviders.split(',') : appCloudProviders;
      }

      return (candidateProvidersToShow || [])
        .filter(provider => CloudProviderRegistry.hasValue(provider, templateUrlPath))
        .map(provider => CloudProviderRegistry.getValue(provider, templateUrlPath));
    };
  });
