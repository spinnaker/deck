import { module } from 'angular';

import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider } from './application.state.provider';
import { STATE_CONFIG_PROVIDER, StateConfigProvider, INestedState } from 'core/navigation/state.provider';
import { NgReact } from 'core/reactShims';

export const APPLICATIONS_STATE_PROVIDER = 'spinnaker.core.application.applications.state';
module(APPLICATIONS_STATE_PROVIDER, [
  STATE_CONFIG_PROVIDER,
  APPLICATION_STATE_PROVIDER,
]).config((stateConfigProvider: StateConfigProvider, applicationStateProvider: ApplicationStateProvider) => {

  const applicationsState: INestedState = {
    name: 'applications',
    url: '/applications',
    views: {
      'main@': {
        component: NgReact.Applications, $type: 'react',
      }
    },
    data: {
      pageTitleMain: {
        label: 'Applications'
      }
    },
    children: [],
  };

  applicationStateProvider.addParentState(applicationsState, 'main@');
  stateConfigProvider.addToRootState(applicationsState);
  stateConfigProvider.addRewriteRule('/applications/{application}', '/applications/{application}/clusters');
});
