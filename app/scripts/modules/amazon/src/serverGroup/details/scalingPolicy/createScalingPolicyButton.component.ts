import { module } from 'angular';
import { react2angular } from 'react2angular';
import { CreateScalingPolicyButton } from './CreateScalingPolicyButton';

export const CREATE_SCALING_POLICY_BUTTON = 'spinnaker.amazon.serverGroup.details.scaling.policy.button';
module(CREATE_SCALING_POLICY_BUTTON, [])
  .component('createScalingPolicyButton', react2angular(CreateScalingPolicyButton, ['application', 'serverGroup']));
