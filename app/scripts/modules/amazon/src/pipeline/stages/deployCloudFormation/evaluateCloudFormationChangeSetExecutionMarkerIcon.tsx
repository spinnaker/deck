import * as React from 'react';
import { IExecutionMarkerIconProps } from '@spinnaker/core';

export const EvaluateCloudFormationChangeSetExecutionMarkerIcon = (props: IExecutionMarkerIconProps) => {
  const { stage } = props;
  if (
    stage.isRunning &&
    stage.stages[0].context.changeSetContainsReplacement &&
    stage.stages[0].context.actionOnReplacement === 'ask'
  ) {
    stage.requiresAttention = true;
    return <span className="fa fa-child" />;
  }
  return null;
};
