'use strict';

let angular = require('angular');

import {STATES_PROVIDER} from 'core/navigation/states.provider';

module.exports = angular
  .module('spinnaker.netflix.tableau.states', [
    STATES_PROVIDER,
    require('./application/appTableau.controller'),
    require('./summary/summaryTableau.controller'),
    require('./tableau.dataSource'),
  ])
  .config(function(statesProvider) {
    var appTableau = {
      name: 'analytics',
      url: '/analytics',
      reloadOnSearch: false,
      views: {
        'insight': {
          templateUrl: require('./application/appTableau.html'),
          controller: 'AppTableauCtrl as ctrl',
        }
      },
      data: {
        pageTitleSection: {
          title: 'Analytics'
        }
      },
    };

    var summaryTableau = {
      name: 'analytics',
      url: '/analytics',
      reloadOnSearch: false,
      views: {
        'main@': {
          templateUrl: require('./summary/summaryTableau.html'),
          controller: 'SummaryTableauCtrl as ctrl',
        }
      },
      data: {
        pageTitleSection: {
          title: 'Analytics'
        }
      },
    };

    statesProvider.addStateConfig({ parent: 'application', state: appTableau });
    statesProvider.addStateConfig({ parent: 'home', state: summaryTableau });
  });
