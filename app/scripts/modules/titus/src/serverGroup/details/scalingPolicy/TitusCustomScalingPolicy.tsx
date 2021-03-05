import * as React from 'react';
import { Application, IServerGroup, Overridable } from '@spinnaker/core';

export interface ITitusCustomScalingPolicyProps {
  application: Application;
  serverGroup: IServerGroup;
}

@Overridable('titus.serverGroup.details.customScaling')
export class TitusCustomScalingPolicy extends React.Component<ITitusCustomScalingPolicyProps> {
  public render(): any {
    return null;
  }
}
