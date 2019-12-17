import { module } from 'angular';

import { STATE_CONFIG_PROVIDER, INestedState, StateConfigProvider } from 'core/navigation/state.provider';

export const STYLEGUIDE_STATES = 'spinnaker.core.styleguide.states';

module(STYLEGUIDE_STATES, [STATE_CONFIG_PROVIDER]).config([
  'stateConfigProvider',
  (stateConfigProvider: StateConfigProvider) => {
    const styleguideState: INestedState = {
      url: '/styleguide',
      name: 'styleguide',
      views: {
        'main@': {
          templateUrl: '/styleguide.html',
        },
      },
      data: {
        pageTitleSection: {
          title: 'Styleguide',
        },
      },
    };
    stateConfigProvider.addToRootState(styleguideState);
  },
]);
