const angular = require('angular')

import {STATE_CONFIG_PROVIDER, INestedState, StateConfigProvider} from 'core/navigation/state.provider';

import './src/styles/app.css'

angular.module('spinnaker.core.styleguide.states', [STATE_CONFIG_PROVIDER])
  .config((stateConfigProvider: StateConfigProvider) => {

  const styleguideState: INestedState = {
    url: '/styleguide',
    name: 'styleguide',
    views: {
      'main@': {
        templateUrl: require('../styleguide/public/styleguide.html')
      }
    },
    data: {
      pageTitleSection: {
        title: 'Styleguide'
      }
    }
  };
  stateConfigProvider.addToRootState(styleguideState);
});

export const STYLEGUIDE_MODULE = 'spinnaker.core.styleguide';

angular
  .module('spinnaker.core.styleguide', ['spinnaker.core.styleguide.states']);

