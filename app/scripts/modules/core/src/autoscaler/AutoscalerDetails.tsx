import React from 'react';
import { Overridable, IOverridableProps } from 'core/overrideRegistry';

export interface IAutoscalerDetailsProps extends IOverridableProps {}

@Overridable('autoscaler.details')
export class AutoscalerDetails extends React.Component<IAutoscalerDetailsProps> {
  public render() {
    return <h3>Autoscaler Details</h3>;
  }
}
