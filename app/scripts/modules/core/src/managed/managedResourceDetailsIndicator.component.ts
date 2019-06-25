import { module } from 'angular';
import { react2angular } from 'react2angular';

import { ManagedResourceDetailsIndicator } from './ManagedResourceDetailsIndicator';

export const MANAGED_RESOURCE_DETAILS_INDICATOR = 'spinnaker.amazon.managed.resourceDetailsIndicator.component';
module(MANAGED_RESOURCE_DETAILS_INDICATOR, []).component(
  'managedResourceDetailsIndicator',
  react2angular(ManagedResourceDetailsIndicator, ['entityTags']),
);
