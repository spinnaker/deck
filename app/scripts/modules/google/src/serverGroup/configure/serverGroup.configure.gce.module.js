'use strict';

import { module } from 'angular';

import { GCE_LOAD_BALANCING_POLICY_SELECTOR } from './wizard/loadBalancingPolicy/loadBalancingPolicySelector.component';
import { GCE_AUTOHEALING_POLICY_SELECTOR } from './wizard/autoHealingPolicy/autoHealingPolicySelector.component';
import { GCE_CACHE_REFRESH } from 'google/cache/cacheRefresh.component';
import { GCE_CUSTOM_INSTANCE_CONFIGURER } from './wizard/customInstance/customInstanceConfigurer.component';
import { GCE_DISK_CONFIGURER } from './wizard/advancedSettings/diskConfigurer.component';
import { GCE_ACCELERATOR_CONFIGURER } from './wizard/advancedSettings/GceAcceleratorConfigurer';
import { GCE_IMAGE_SELECT } from '../../image/ImageSelect';
import { GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_BASICSETTINGS_BASICSETTINGS_COMPONENT } from '../../autoscalingPolicy/components/basicSettings/basicSettings.component';
import { GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT } from '../../autoscalingPolicy/components/metricSettings/metricSettings.component';
import { GOOGLE_INSTANCE_CUSTOM_CUSTOMINSTANCEBUILDER_GCE_SERVICE } from './../../instance/custom/customInstanceBuilder.gce.service';
import { GOOGLE_SERVERGROUP_SERVERGROUP_TRANSFORMER } from '../serverGroup.transformer';
import { GOOGLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE } from './serverGroupConfiguration.service';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ADVANCEDSETTINGS_ADVANCEDSETTINGSSELECTOR_DIRECTIVE } from './wizard/advancedSettings/advancedSettingsSelector.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_ADVANCEDCAPACITYSELECTOR_COMPONENT } from './wizard/capacity/advancedCapacitySelector.component';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_SIMPLECAPACITYSELECTOR_COMPONENT } from './wizard/capacity/simpleCapacitySelector.component';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_LOADBALANCERS_LOADBALANCERSELECTOR_DIRECTIVE } from './wizard/loadBalancers/loadBalancerSelector.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_LOCATION_BASICSETTINGS_CONTROLLER } from './wizard/location/basicSettings.controller';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_SECURITYGROUPS_SECURITYGROUPSREMOVED_DIRECTIVE } from './wizard/securityGroups/securityGroupsRemoved.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_SECURITYGROUPS_SECURITYGROUPSELECTOR_DIRECTIVE } from './wizard/securityGroups/securityGroupSelector.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_REGIONALSELECTOR_DIRECTIVE } from './wizard/zones/regionalSelector.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_TARGETSHAPESELECTOR_DIRECTIVE } from './wizard/zones/targetShapeSelector.directive';
import { GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_ZONESELECTOR_DIRECTIVE } from './wizard/zones/zoneSelector.directive';

export const GOOGLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_GCE_MODULE = 'spinnaker.serverGroup.configure.gce';
export const name = GOOGLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_GCE_MODULE; // for backwards compatibility
module(GOOGLE_SERVERGROUP_CONFIGURE_SERVERGROUP_CONFIGURE_GCE_MODULE, [
  GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_BASICSETTINGS_BASICSETTINGS_COMPONENT,
  GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT,
  GCE_LOAD_BALANCING_POLICY_SELECTOR,
  GCE_AUTOHEALING_POLICY_SELECTOR,
  GOOGLE_INSTANCE_CUSTOM_CUSTOMINSTANCEBUILDER_GCE_SERVICE,
  GCE_CACHE_REFRESH,
  GCE_CUSTOM_INSTANCE_CONFIGURER,
  GCE_DISK_CONFIGURER,
  GCE_ACCELERATOR_CONFIGURER,
  GCE_IMAGE_SELECT,
  GOOGLE_SERVERGROUP_SERVERGROUP_TRANSFORMER,
  GOOGLE_SERVERGROUP_CONFIGURE_SERVERGROUPCONFIGURATION_SERVICE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ADVANCEDSETTINGS_ADVANCEDSETTINGSSELECTOR_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_ADVANCEDCAPACITYSELECTOR_COMPONENT,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_CAPACITY_SIMPLECAPACITYSELECTOR_COMPONENT,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_LOADBALANCERS_LOADBALANCERSELECTOR_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_LOCATION_BASICSETTINGS_CONTROLLER,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_SECURITYGROUPS_SECURITYGROUPSREMOVED_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_SECURITYGROUPS_SECURITYGROUPSELECTOR_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_REGIONALSELECTOR_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_TARGETSHAPESELECTOR_DIRECTIVE,
  GOOGLE_SERVERGROUP_CONFIGURE_WIZARD_ZONES_ZONESELECTOR_DIRECTIVE,
]);
