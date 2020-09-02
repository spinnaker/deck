import { module } from 'angular';
import { react2angular } from 'react2angular';

import { InstanceStatus } from './InstanceStatus';

export const INSTANCE_STATUS_COMPONENT = 'spinnaker.application.instanceStatus.component';

module(INSTANCE_STATUS_COMPONENT, []).component(
  'instanceStatus',
  react2angular(InstanceStatus, ['healthMetrics', 'healthState', 'metricTypes', 'customHealthUrl', 'privateIpAddress']),
);
