import { module } from 'angular';
import { react2angular } from 'react2angular';

import { CapacityDetailsSection } from './CapacityDetailsSection';

export const TITUS_SERVERGROUP_DETAILS_CAPACITYDETAILSSECTION = 'titus.servergroup.details.capacitydetailssection';
module(TITUS_SERVERGROUP_DETAILS_CAPACITYDETAILSSECTION, []).component(
  'titusCapacityDetailsSection',
  react2angular(CapacityDetailsSection, ['serverGroup', 'app']),
);
