'use strict';

let angular = require('angular');

import {STATES_PROVIDER} from 'core/navigation/states.provider';

module.exports = angular
  .module('spinnaker.netflix.ci.states', [
    STATES_PROVIDER,
    require('./ci.controller'),
    require('./detail/detail.controller'),
    require('./detail/detailTab/detailTab.controller'),
  ])
  .config(function(statesProvider) {
    var detailTabsPanel = {
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

    var detailPanel = {
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

    var appCI = {
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

    statesProvider.addStateConfig({ parent: 'application', state: appCI });
  });
