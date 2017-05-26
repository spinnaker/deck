import { module } from 'angular';
import { react2angular } from 'react2angular';

import { PermissionsConfigurer } from './PermissionsConfigurer';

export const PERMISSIONS_CONFIGURER_COMPONENT = 'spinnaker.application.permissionsConfigurer.component';
module(PERMISSIONS_CONFIGURER_COMPONENT, [])
  .component('permissionsConfigurer', react2angular(PermissionsConfigurer, ['permissions', 'requiredGroupMembership', 'onPermissionsChange']));
