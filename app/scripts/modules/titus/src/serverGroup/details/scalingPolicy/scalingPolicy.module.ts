import { module } from 'angular';

import { SCALING_POLICY_SUMMARY } from './scalingPolicySummary.component';
import { TITUS_CREATE_SCALING_POLICY_BUTTON } from './createScalingPolicyButton.component';
import { TARGET_TRACKING_MODULE } from './targetTracking/targetTracking.module';
import { TITUS_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT } from './alarmBasedSummary.component';

export const SCALING_POLICY_MODULE = 'spinnaker.titus.scalingPolicy.module';
module(SCALING_POLICY_MODULE, [
  SCALING_POLICY_SUMMARY,
  TITUS_CREATE_SCALING_POLICY_BUTTON,
  TARGET_TRACKING_MODULE,
  TITUS_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT,
]);
