import * as React from 'react';
import { Overridable, IOverridableProps } from 'core/overrideRegistry';

export interface IServerGroupManagerDetailsProps extends IOverridableProps {
}

@Overridable('serverGroupManager.details')
export class ServerGroupManagerDetails extends React.Component<IServerGroupManagerDetailsProps> {
  public render() {
    return (
      <h3>Server Group Manager Details</h3>
    );
  }
}
