import { module } from 'angular';

import {
  APPLICATION_STATE_PROVIDER,
  ApplicationStateProvider,
  INestedState,
  STATE_CONFIG_PROVIDER,
  StateConfigProvider
} from '@spinnaker/core';

import { APPLICATION_TABLEAU_CONTROLLER } from './application/appTableau.controller';
import { SUMMARY_TABLEAU_CONTROLLER } from './summary/summaryTableau.controller';
import { TABLEAU_DATASOURCE } from './tableau.dataSource';

export const TABLEAU_STATES = 'spinnaker.netflix.tableau.states';
module(TABLEAU_STATES, [
  APPLICATION_STATE_PROVIDER,
  STATE_CONFIG_PROVIDER,
  SUMMARY_TABLEAU_CONTROLLER,
  APPLICATION_TABLEAU_CONTROLLER,
  TABLEAU_DATASOURCE
]).config((applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {

  const appState: INestedState = {
    name: 'analytics',
    url: '/analytics',
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

  const summaryState: INestedState = {
    name: 'analytics',
    url: '/analytics',
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

  applicationStateProvider.addChildState(appState);
  stateConfigProvider.addToRootState(summaryState);
});
