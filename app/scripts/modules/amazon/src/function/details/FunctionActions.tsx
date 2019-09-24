import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

import { Application, ApplicationReader, FunctionWriter, SETTINGS, NgReact, ReactInjector } from '@spinnaker/core';

import { IAmazonFunction, IAmazonFunctionDeleteCommand } from 'amazon/domain';

import { IFunctionFromStateParams } from './AmazonFunctionDetails';
import { CreateLambdaFunction } from '../CreateLambdaFunction';

export interface IFunctionActionsProps {
  app: Application;
  functionDef: IAmazonFunction;
  functionFromParams: IFunctionFromStateParams;
}

export interface IFunctionActionsState {
  application: Application;
}

export class FunctionActions extends React.Component<IFunctionActionsProps, IFunctionActionsState> {
  constructor(props: IFunctionActionsProps) {
    super(props);

    const { app, functionDef } = this.props;
    let application: Application;

    const functionAppName = functionDef.functionName.split('-')[0];
    if (functionAppName === app.name) {
      // Name matches the currently active application
      application = app;
    } else {
      // Load balancer is a part of a different application
      ApplicationReader.getApplication(functionAppName)
        .then(functionApp => {
          this.setState({ application: functionApp });
        })
        .catch(() => {
          // If the application can't be found, just use the old one
          this.setState({ application: this.props.app });
        });
    }

    this.state = {
      application,
    };
  }

  public editFunction = (): void => {
    const { functionDef } = this.props;
    const { application } = this.state;
    const FunctionModal = CreateLambdaFunction;
    FunctionModal.show({ app: application, functionDef });
  };

  public deleteFunction = (): void => {
    const { app, functionDef, functionFromParams } = this.props;

    const taskMonitor = {
      application: app,
      title: 'Deleting ' + functionFromParams.functionName,
    };
    const command: IAmazonFunctionDeleteCommand = {
      cloudProvider: functionDef.cloudProvider,
      functionName: functionDef.functionName,
      region: functionDef.region,
      credentials: functionDef.account,
    };

    const submitMethod = () => FunctionWriter.deleteFunction(command, app);

    ReactInjector.confirmationModalService.confirm({
      header: `Really delete ${functionFromParams.functionName} in ${functionFromParams.region}: ${functionFromParams.account}?`,
      buttonText: `Delete ${functionFromParams.functionName}`,
      provider: 'aws',
      account: functionFromParams.account,
      applicationName: app.name,
      taskMonitorConfig: taskMonitor,
      submitMethod,
    });
  };

  private entityTagUpdate = (): void => {
    this.props.app.functions.refresh();
  };

  public render() {
    const { app, functionDef } = this.props;
    const { application } = this.state;

    const { AddEntityTagLinks } = NgReact;

    return (
      <div style={{ display: 'inline-block' }}>
        <Dropdown className="dropdown" id="function-actions-dropdown">
          <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
            <span>Function Actions</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <li className={!application ? 'disabled' : ''}>
              <a className="clickable" onClick={this.editFunction}>
                Edit Function
              </a>
            </li>
            {functionDef.functionName && (
              <li>
                <a className="clickable" onClick={this.deleteFunction}>
                  Delete Function
                </a>
              </li>
            )}
            {SETTINGS && SETTINGS.feature.entityTags && (
              <AddEntityTagLinks
                component={functionDef}
                application={app}
                entityType="function"
                onUpdate={this.entityTagUpdate}
              />
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
