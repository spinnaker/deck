import { module } from 'angular';

import {
  APPLICATION_STATE_PROVIDER, ApplicationStateProvider,
} from 'core/application/application.state.provider';
import { CloudProviderRegistry } from 'core/cloudProvider/cloudProvider.registry';
import { INestedState, STATE_CONFIG_PROVIDER, StateConfigProvider } from 'core/navigation/state.provider';
import { StateParams } from '@uirouter/angularjs';
import { Application } from 'core/application/application.model';
import { ApplicationModelBuilder } from '../application/applicationModel.builder';
import { VersionedCloudProviderService } from 'core/cloudProvider';

export const INSTANCE_STATES = 'spinnaker.core.instance.states';
module(INSTANCE_STATES, [
  APPLICATION_STATE_PROVIDER,
  STATE_CONFIG_PROVIDER,
]).config((applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {

  const instanceDetails: INestedState = {
    name: 'instanceDetails',
    url: '/instanceDetails/:provider/:instanceId',
    views: {
      'detail@../insight': {
        templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry', 'versionedCloudProviderService', 'app',
          ($templateCache: ng.ITemplateCacheService,
           $stateParams: StateParams,
           cloudProviderRegistry: CloudProviderRegistry,
           versionedCloudProviderService: VersionedCloudProviderService,
           app: Application) => {
            return versionedCloudProviderService.getInstanceProviderVersion($stateParams.provider, $stateParams.instanceId, app).then((providerVersion: string) =>
              $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'instance.detailsTemplateUrl', providerVersion))
            );
        }],
        controllerProvider: ['$stateParams', 'cloudProviderRegistry', 'versionedCloudProviderService', 'app',
          ($stateParams: StateParams,
           cloudProviderRegistry: CloudProviderRegistry,
           versionedCloudProviderService: VersionedCloudProviderService,
           app: Application) => {
            return versionedCloudProviderService.getInstanceProviderVersion($stateParams.provider, $stateParams.instanceId, app).then((providerVersion: string) =>
              cloudProviderRegistry.getValue($stateParams.provider, 'instance.detailsController', providerVersion)
            );
        }],
        controllerAs: 'ctrl'
      }
    },
    resolve: {
      overrides: () => { return {}; },
      instance: ['$stateParams', ($stateParams: StateParams) => {
        return {
          instanceId: $stateParams.instanceId
        };
      }]
    },
    data: {
      pageTitleDetails: {
        title: 'Instance Details',
        nameParam: 'instanceId'
      },
      history: {
        type: 'instances',
      },
    }
  };

  const multipleInstances: INestedState = {
    name: 'multipleInstances',
    url: '/multipleInstances',
    views: {
      'detail@../insight': {
        templateUrl: require('../instance/details/multipleInstances.view.html'),
        controller: 'MultipleInstancesCtrl',
        controllerAs: 'vm'
      }
    },
    data: {
      pageTitleDetails: {
        title: 'Multiple Instances',
      },
    }
  };

  const standaloneInstance: INestedState = {
    name: 'instanceDetails',
    url: '/instance/:provider/:account/:region/:instanceId',
    views: {
      'main@': {
        templateUrl: require('../presentation/standalone.view.html'),
        controllerProvider: ['$stateParams', 'versionedCloudProviderService',
          ($stateParams: StateParams,
           versionedCloudProviderService: VersionedCloudProviderService) => {
            return versionedCloudProviderService.getValue($stateParams.provider, $stateParams.account, 'instance.detailsController');
        }],
        controllerAs: 'ctrl'
      }
    },
    resolve: {
      instance: ['$stateParams', ($stateParams: StateParams) => {
        return {
          instanceId: $stateParams.instanceId,
          account: $stateParams.account,
          region: $stateParams.region,
          noApplication: true
        };
      }],
      app: ['applicationModelBuilder', (applicationModelBuilder: ApplicationModelBuilder): Application => {
        return applicationModelBuilder.createStandaloneApplication('(standalone instance)');
      }],
      overrides: () => { return {}; },
    },
    data: {
      pageTitleDetails: {
        title: 'Instance Details',
        nameParam: 'instanceId'
      },
      history: {
        type: 'instances',
      },
    }
  };

  applicationStateProvider.addInsightDetailState(instanceDetails);
  applicationStateProvider.addInsightDetailState(multipleInstances);
  stateConfigProvider.addToRootState(standaloneInstance);

});
