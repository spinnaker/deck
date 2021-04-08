import { module } from 'angular';

import { PAGE_MODAL_CONTROLLER } from './pageApplicationOwner.modal.controller';

export const PAGER_DUTY_MODULE = 'spinnaker.core.pagerDuty';
module(PAGER_DUTY_MODULE, [PAGE_MODAL_CONTROLLER]);
