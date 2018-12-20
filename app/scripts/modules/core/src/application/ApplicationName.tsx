import * as React from 'react';

import { Application } from 'core/application';

export interface IApplicationNameProps {
  app: Application;
}

export class ApplicationName extends React.Component<IApplicationNameProps> {
  public render() {
    return <span className="application-name">{this.props.app.name}</span>;
  }
}
