import { IController, module } from 'angular';

import { Registry } from 'core/registry';

import { GroupExecutionLabel } from './GroupExecutionLabel';
import { GroupMarkerIcon } from './GroupMarkerIcon';

export const GROUP_STAGE = 'spinnaker.core.pipeline.stage.groupStage';

export class GroupStage implements IController {}

module(GROUP_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      controller: 'GroupStageCtrl',
      description: 'A group of stages',
      executionLabelComponent: GroupExecutionLabel,
      markerIcon: GroupMarkerIcon,
      key: 'group',
      label: 'Group',
      templateUrl: require('./groupStage.html'),
      useCustomTooltip: true,
      synthetic: true,
      validators: [],
    });
  })
  .controller('GroupStageCtrl', GroupStage);
