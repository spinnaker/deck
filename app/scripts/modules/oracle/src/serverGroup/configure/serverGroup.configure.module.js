import { ORACLE_SERVERGROUP_CONFIGURE_WIZARD_BASICSETTINGS_BASICSETTINGS_CONTROLLER } from './wizard/basicSettings/basicSettings.controller';
import { ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_CAPACITYSELECTOR_COMPONENT } from './wizard/capacity/capacitySelector.component';
import { ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE } from './serverGroupConfiguration.service';
('use strict');

import { module } from 'angular';

export const ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_MODULE = 'spinnaker.oracle.serverGroup.configure';
export const name = ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_MODULE; // for backwards compatibility
module(ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_MODULE, [
  ORACLE_SERVERGROUP_CONFIGURE_WIZARD_BASICSETTINGS_BASICSETTINGS_CONTROLLER,
  ORACLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_CAPACITYSELECTOR_COMPONENT,
  ORACLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE,
]);
