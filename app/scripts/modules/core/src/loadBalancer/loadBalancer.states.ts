import { module } from 'angular';
import { StateParams } from '@uirouter/angularjs';

import { INestedState, StateConfigProvider } from 'core/navigation/state.provider';
import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider } from 'core/application/application.state.provider';
import { VersionedCloudProviderRegistry } from 'core/cloudProvider';
import { filterModelConfig } from 'core/loadBalancer/filter/loadBalancerFilter.model';
import { LOAD_BALANCERS_COMPONENT } from 'core/loadBalancer/loadBalancers.component';
import { LoadBalancers } from 'core/loadBalancer/LoadBalancers';

export const LOAD_BALANCER_STATES = 'spinnaker.core.loadBalancer.states';
module(LOAD_BALANCER_STATES, [
  APPLICATION_STATE_PROVIDER,
  LOAD_BALANCERS_COMPONENT
]).config((applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {

  const loadBalancerDetails: INestedState = {
    name: 'loadBalancerDetails',
    url: '/loadBalancerDetails/:provider/:accountId/:region/:vpcId/:name',
    params: {
      vpcId: {
        value: null,
        squash: true,
      },
    },
    views: {
      'detail@../insight': {
        templateProvider: ['$templateCache', '$stateParams', 'versionedCloudProviderRegistry',
          ($templateCache: ng.ITemplateCacheService,
           $stateParams: StateParams,
           versionedCloudProviderRegistry: VersionedCloudProviderRegistry) => {
            return versionedCloudProviderRegistry.getValue($stateParams.provider, $stateParams.accountId, 'loadBalancer.detailsTemplateUrl').then($templateCache.get);
        }],
        controllerProvider: ['$stateParams', 'versionedCloudProviderRegistry',
          ($stateParams: StateParams,
           versionedCloudProviderRegistry: VersionedCloudProviderRegistry) => {
            return versionedCloudProviderRegistry.getValue($stateParams.provider, $stateParams.accountId, 'loadBalancer.detailsController');
        }],
        controllerAs: 'ctrl'
      }
    },
    resolve: {
      loadBalancer: ['$stateParams', ($stateParams: StateParams) => {
        return {
          name: $stateParams.name,
          accountId: $stateParams.accountId,
          region: $stateParams.region,
          vpcId: $stateParams.vpcId
        };
      }]
    },
    data: {
      pageTitleDetails: {
        title: 'Load Balancer Details',
        nameParam: 'name',
        accountParam: 'accountId',
        regionParam: 'region'
      },
      history: {
        type: 'loadBalancers',
      },
    }
  };

  const loadBalancers: INestedState = {
    url: `/loadBalancers?${stateConfigProvider.paramsToQuery(filterModelConfig)}`,
    name: 'loadBalancers',
    views: {
      'nav': {
        template: '<load-balancer-filter app="$resolve.app"></load-balancer-filter>',
      },
      'master': {
        component: LoadBalancers, $type: 'react'
      }
    },
    params: stateConfigProvider.buildDynamicParams(filterModelConfig),
    data: {
      pageTitleSection: {
        title: 'Load Balancers'
      }
    },
    children: [],
  };

  applicationStateProvider.addInsightState(loadBalancers);
  applicationStateProvider.addInsightDetailState(loadBalancerDetails);
});
