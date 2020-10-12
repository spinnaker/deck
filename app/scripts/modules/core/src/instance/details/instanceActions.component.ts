import { module } from 'angular';
import { react2angular } from 'react2angular';
import { InstanceActions } from './InstanceActions';

export const CORE_INSTANCE_DETAILS_INSTANCEACTIONS_COMPONENT = 'spinnaker.core.instance.details.instanceActions';
export const name = CORE_INSTANCE_DETAILS_INSTANCEACTIONS_COMPONENT; // for backwards compatibility

module(name, []).component('instanceActions', react2angular(InstanceActions, ['actions', 'title']));
