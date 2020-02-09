import { module } from 'angular';
import { StateParams } from '@uirouter/angularjs';

import { INestedState } from 'core/navigation';
import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider } from 'core/application';
import { AutoscalerDetails } from './AutoscalerDetails';

export const AUTOSCALER_STATES = 'spinnaker.core.autoscaler.states';
module(AUTOSCALER_STATES, [APPLICATION_STATE_PROVIDER]).config([
  'applicationStateProvider',
  (applicationStateProvider: ApplicationStateProvider) => {
    const autoscalerDetails: INestedState = {
      name: 'autoscalerDetails',
      url: '/autoscalerDetails/:provider/:accountId/:region/:name',
      views: {
        'detail@../insight': {
          component: AutoscalerDetails,
          $type: 'react',
        },
      },
      resolve: {
        accountId: ['$stateParams', ($stateParams: StateParams) => $stateParams.accountId],
        autoscalerMetadata: [
          '$stateParams',
          ($stateParams: StateParams) => {
            return {
              name: $stateParams.name,
              accountId: $stateParams.accountId,
              region: $stateParams.region,
            };
          },
        ],
      },
      data: {
        pageTitleDetails: {
          title: 'Autoscaler Details',
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region',
        },
        history: {
          type: 'autoscalers',
        },
      },
    };

    applicationStateProvider.addInsightDetailState(autoscalerDetails);
  },
]);
