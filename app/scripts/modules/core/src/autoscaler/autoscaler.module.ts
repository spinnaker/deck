import { module } from 'angular';

import { AUTOSCALER_DATA_SOURCE } from './autoscaler.dataSource';
import { AUTOSCALER_STATES } from './autoscaler.states';

export const AUTOSCALER_MODULE = 'spinnaker.core.autoscaler';

module(AUTOSCALER_MODULE, [AUTOSCALER_DATA_SOURCE, AUTOSCALER_STATES]);
