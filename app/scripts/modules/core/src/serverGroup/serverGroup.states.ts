import { module } from 'angular';

import { StateParams } from '@uirouter/angularjs';
import { STATE_CONFIG_PROVIDER, INestedState, StateConfigProvider } from 'core/navigation/state.provider';
import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider } from 'core/application/application.state.provider';
import { filterModelConfig } from 'core/cluster/filter/ClusterFilterModel';
import { ClusterFilters } from 'core/cluster/filter/ClusterFilters';

import { ServerGroupDetailsWrapper } from './details/ServerGroupDetailsWrapper';

export const SERVER_GROUP_STATES = 'spinnaker.core.serverGroup.states';
module(SERVER_GROUP_STATES, [APPLICATION_STATE_PROVIDER, STATE_CONFIG_PROVIDER]).config([
  'applicationStateProvider',
  'stateConfigProvider',
  (applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {
    const clusters: INestedState = {
      name: 'clusters',
      url: `/clusters?${stateConfigProvider.paramsToQuery(filterModelConfig)}`,
      views: {
        nav: { component: ClusterFilters, $type: 'react' },
        master: {
          templateUrl: require('../cluster/allClusters.html'),
          controller: 'AllClustersCtrl',
          controllerAs: 'ctrl',
        },
      },
      params: stateConfigProvider.buildDynamicParams(filterModelConfig),
      data: {
        pageTitleSection: {
          title: 'Clusters',
        },
      },
      children: [],
    };

    const serverGroupDetails: INestedState = {
      name: 'serverGroup',
      url: '/serverGroupDetails/:provider/:accountId/:region/:serverGroup',
      views: {
        'detail@../insight': { component: ServerGroupDetailsWrapper, $type: 'react' },
      },
      resolve: {
        serverGroup: [
          '$stateParams',
          ($stateParams: StateParams) => {
            return {
              name: $stateParams.serverGroup,
              accountId: $stateParams.accountId,
              region: $stateParams.region,
            };
          },
        ],
      },
      data: {
        pageTitleDetails: {
          title: 'Server Group Details',
          nameParam: 'serverGroup',
          accountParam: 'accountId',
          regionParam: 'region',
        },
        history: {
          type: 'serverGroups',
        },
      },
    };

    const multipleServerGroups: INestedState = {
      name: 'multipleServerGroups',
      url: '/multipleServerGroups',
      views: {
        'detail@../insight': {
          templateUrl: require('../serverGroup/details/multipleServerGroups.view.html'),
          controller: 'MultipleServerGroupsCtrl',
          controllerAs: 'vm',
        },
      },
      data: {
        pageTitleDetails: {
          title: 'Multiple Server Groups',
        },
      },
    };

    applicationStateProvider.addInsightState(clusters);
    applicationStateProvider.addInsightDetailState(serverGroupDetails);
    applicationStateProvider.addInsightDetailState(multipleServerGroups);
  },
]);
