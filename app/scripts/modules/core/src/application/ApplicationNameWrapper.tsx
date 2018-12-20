import * as React from 'react';

import { Application } from 'core/application/application.model';
import { ReactInjector } from 'core/reactShims';

import { ApplicationName } from './ApplicationName';

export interface IApplicationNameProps {
  app: Application;
}

export class ApplicationNameWrapper extends React.Component<IApplicationNameProps> {
  public render(): React.ReactElement<ApplicationNameWrapper> {
    const { overrideRegistry } = ReactInjector;
    const config = overrideRegistry.getComponent('applicationName');
    const Title = config || ApplicationName;

    return <Title {...this.props} />;
  }
}
