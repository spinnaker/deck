import { module } from 'angular';

import { STATE_CONFIG_PROVIDER, INestedState, StateConfigProvider } from 'core/navigation';

import { Pager } from './Pager';

export const PAGER_STATES = 'spinnaker.core.pager.states';

module(PAGER_STATES, [STATE_CONFIG_PROVIDER]).config([
  'stateConfigProvider',
  (stateConfigProvider: StateConfigProvider) => {
    const pageState: INestedState = {
      url: '/page?app&q&keys&by&direction&hideNoApps&subject&&details',
      name: 'page',
      views: {
        'main@': { component: Pager, $type: 'react' },
      },
      params: {
        app: {
          dynamic: true,
          type: 'string',
          value: '',
          squash: true,
        },
        q: {
          dynamic: true,
          type: 'string',
          value: '',
          squash: true,
        },
        subject: {
          dynamic: true,
          type: 'string',
          value: '',
          squash: true,
        },
        details: {
          dynamic: true,
          type: 'string',
          value: '',
          squash: true,
        },
        hideNoApps: {
          dynamic: true,
          type: 'boolean',
          value: false,
          squash: true,
        },
        keys: {
          dynamic: true,
          value: [],
          squash: true,
          array: true,
        },
        by: {
          dynamic: true,
          type: 'string',
          value: 'service',
          squash: true,
        },
        direction: {
          dynamic: true,
          type: 'string',
          value: 'ASC',
          squash: true,
        },
      },
      data: {
        pageTitleSection: {
          title: 'Pager',
        },
      },
    };
    stateConfigProvider.addToRootState(pageState);
  },
]);
