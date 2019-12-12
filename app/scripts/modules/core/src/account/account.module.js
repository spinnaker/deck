'use strict';

import { ACCOUNT_TAG_COMPONENT } from './accountTag.component';
import { ACCOUNT_SELECT_WRAPPER } from './accountSelect.wrapper';
import { ACCOUNT_SELECT_COMPONENT } from './accountSelectField.component';
import { CORE_ACCOUNT_PROVIDERTOGGLES_DIRECTIVE } from './providerToggles.directive';
import { CORE_ACCOUNT_COLLAPSIBLEACCOUNTTAG_DIRECTIVE } from './collapsibleAccountTag.directive';

import { module } from 'angular';

export const CORE_ACCOUNT_ACCOUNT_MODULE = 'spinnaker.core.account';
export const name = CORE_ACCOUNT_ACCOUNT_MODULE; // for backwards compatibility
module(CORE_ACCOUNT_ACCOUNT_MODULE, [
  CORE_ACCOUNT_PROVIDERTOGGLES_DIRECTIVE,
  ACCOUNT_SELECT_COMPONENT,
  CORE_ACCOUNT_COLLAPSIBLEACCOUNTTAG_DIRECTIVE,
  ACCOUNT_TAG_COMPONENT,
  ACCOUNT_SELECT_WRAPPER,
]);
