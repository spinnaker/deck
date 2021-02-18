import { IOverridableProps, Overridable } from 'core/overrideRegistry';
import { AngularJSAdapter } from 'core/reactShims';
import React from 'react';

export interface IApplicationConfigDetailsProps extends IOverridableProps {}

@Overridable('applicationConfigView')
export class ApplicationConfig extends React.Component<IApplicationConfigDetailsProps> {
  public render() {
    const templateUrl = require('./applicationConfig.view.html');
    return (
      <AngularJSAdapter
        {...this.props}
        templateUrl={templateUrl}
        controller="ApplicationConfigController"
        controllerAs="config"
      />
    );
  }
}
