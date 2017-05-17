import { module } from 'angular';

import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider, INestedState } from '@spinnaker/core';

export const CI_STATES = 'spinnaker.netflix.ci.states';
module(CI_STATES, [
  APPLICATION_STATE_PROVIDER
]).config((applicationStateProvider: ApplicationStateProvider) => {

  const detailTabsPanel: INestedState = {
    name: 'detailTab',
    url: '/:tab',
    views: {
      'detailTab': {
        templateUrl: require('./detail/detailTab/detailTabView.html'),
        controller: 'CiDetailTabCtrl',
        controllerAs: 'ctrl',
      }
    }
  };

  const detailPanel: INestedState = {
    name: 'detail',
    url: '/detail/:buildId',
    views: {
      'detail': {
        templateUrl: require('./detail/detailView.html'),
        controller: 'CiDetailCtrl',
        controllerAs: 'ctrl'
      }
    },
    children: [
      detailTabsPanel
    ]
  };

  const appCI: INestedState = {
    name: 'ci',
    url: '/ci',
    views: {
      'insight': {
        templateUrl: require('./ci.html'),
        controller: 'NetflixCiCtrl',
        controllerAs: 'ctrl'
      }
    },
    data: {
      pageTitleSection: {
        title: 'CI'
      }
    },
    children: [
      detailPanel
    ]
  };

  applicationStateProvider.addChildState(appCI);
});
