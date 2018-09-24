import * as React from 'react';
import * as moment from 'moment';
import { relativeTime } from '@spinnaker/core';

export interface IKubernetesManifestCondition {
  status: string;
  type: string;
  lastTransitionTime: string;
  message: string;
}

export interface IKubernetesManifestConditionProps {
  condition: IKubernetesManifestCondition;
}

export class ManifestCondition extends React.Component<IKubernetesManifestConditionProps> {
  public render() {
    const { condition } = this.props;
    const transitionTime = moment(condition.lastTransitionTime);
    return [
      <span key="properties">
        {condition.status === 'True' && <span style={{ marginRight: '3px' }} className="glyphicon glyphicon-Normal" />}
        {condition.status === 'False' && <span style={{ marginRight: '3px' }} className="glyphicon glyphicon-Warn" />}
        {condition.status === 'Unknown' && <span style={{ marginRight: '3px' }}>?</span>}
        <b style={{ marginRight: '3px' }}>{condition.type}</b>
        <i>{transitionTime.isValid() && relativeTime(transitionTime.valueOf())}</i>
      </span>,
      <div key="message">{condition.message}</div>,
    ];
  }
}
