import * as React from 'react';
import { cloneDeep } from 'lodash';
import {
  IFunctionModalProps,
  FunctionWriter,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  WizardModal,
  WizardPage,
  noop,
  Application,
} from '@spinnaker/core';

import { IAmazonFunction, IAmazonFunctionUpsertCommand } from 'amazon/domain';
import { FunctionBasicInformation } from './configure/FunctionBasicInformation';
import { ExecutionRole } from './configure/ExecutionRole';
<<<<<<< HEAD
=======
import { FunctionSettings } from './configure/FunctionSettings';
>>>>>>> f86a932a7... Edit and delete functions
import { FunctionEnvironmentVariables } from './configure/FunctionEnvironmentVariables';
<<<<<<< HEAD
=======
import { Network } from './configure/Network';
import { AwsFunctionTransformer } from './function.transformer';
import { FunctionTags } from './configure/FunctionTags';
<<<<<<< HEAD
>>>>>>> 53c727e5f... Added tags field  in Create function modal
=======
import { FunctionDebugAndErrorHandling } from './configure/FunctionDebugAndErrorHandling';
>>>>>>> f86a932a7... Edit and delete functions

export interface IAmazonCreateFunctionProps extends IFunctionModalProps {
  app: Application;
  functionDef: IAmazonFunction;
}
export interface IAmazonCreateFunctionState {
  isNew: boolean;
  functionCommand: IAmazonFunctionUpsertCommand;
  taskMonitor: TaskMonitor;
}

export class CreateLambdaFunction extends React.Component<IAmazonCreateFunctionProps, IAmazonCreateFunctionState> {
  public static defaultProps: Partial<IAmazonCreateFunctionProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  constructor(props: IAmazonCreateFunctionProps) {
    super(props);
<<<<<<< HEAD
<<<<<<< HEAD

<<<<<<< HEAD
    const funcCommand = props.command as IAmazonFunctionUpsertCommand;
=======
    const funcCommand = props.command
      ? (props.command as IAmazonFunctionUpsertCommand) // ejecting from a wizard
      : props.functionDef
      ? AwsFunctionTransformer.convertFunctionForEditing(props.functionDef)
      : AwsFunctionTransformer.constructNewAwsFunctionTemplate(props.app);
>>>>>>> 53c727e5f... Added tags field  in Create function modal
=======
    const functionTransformer = new AwsFunctionTransformer();
    const funcCommand = props.command
      ? (props.command as IAmazonFunctionUpsertCommand) // ejecting from a wizard
      : props.functionDef
      ? functionTransformer.convertFunctionForEditing(props.functionDef)
      : functionTransformer.constructNewAwsFunctionTemplate(props.app);
>>>>>>> f86a932a7... Edit and delete functions

=======
>>>>>>> 5ae02b7cf... Added account dropdown
    this.state = {
      isNew: !props.functionDef,
      functionCommand: props.command,
      taskMonitor: null,
    };
  }

  private _isUnmounted = false;
  private refreshUnsubscribe: () => void;

  public static show(props: IAmazonCreateFunctionProps): Promise<IAmazonFunctionUpsertCommand> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateLambdaFunction, props, modalProps);
  }

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  protected onApplicationRefresh(values: IAmazonFunctionUpsertCommand): void {
    if (this._isUnmounted) {
      return;
    }

    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const newStateParams = {
      name: values.name,
      accountId: values.credentials,
      region: values.region,
      vpcId: values.vpcId,
      provider: 'aws',
    };

    if (!ReactInjector.$state.includes('**.functionDetails')) {
      ReactInjector.$state.go('.functionDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.functionDetails', newStateParams);
    }
  }

  private onTaskComplete(values: IAmazonFunctionUpsertCommand): void {
    this.props.app.functions.refresh();
    this.refreshUnsubscribe = this.props.app.functions.onNextRefresh(null, () => this.onApplicationRefresh(values));
  }

  private submit = (values: IAmazonFunctionUpsertCommand): void => {
    const { app } = this.props;
    const { isNew } = this.state;
    const functionCommandFormatted = cloneDeep(values);
    if (isNew && functionCommandFormatted.functionName.indexOf(app.name) != 0) {
      functionCommandFormatted.functionName = app.name.concat('-').concat(functionCommandFormatted.functionName);
    }
    const descriptor = isNew ? 'Create' : 'Update';

    const taskMonitor = new TaskMonitor({
      application: app,
      title: `${isNew ? 'Creating' : 'Updating'} your function`,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      onTaskComplete: () => this.onTaskComplete(functionCommandFormatted),
    });

    taskMonitor.submit(() => {
      return FunctionWriter.upsertFunction(functionCommandFormatted, app, descriptor);
    });

    this.setState({ taskMonitor });
  };

  public render() {
    const {  app, dismissModal, forPipelineConfig, functionDef } = this.props;
    const { isNew, functionCommand, taskMonitor } = this.state;

    let heading = forPipelineConfig ? 'Configure Existing Function' : 'Create New Function';
    if (!isNew) {
      heading = `Edit ${functionCommand.functionName}: ${functionCommand.region}: ${functionCommand.credentials}`;
    }

    return (
      <WizardModal<IAmazonFunctionUpsertCommand>
        heading={heading}
        initialValues={functionCommand}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={forPipelineConfig ? (isNew ? 'Add' : 'Done') : isNew ? 'Create' : 'Update'}
        render={({ formik, nextIdx, wizard }) => {
          return (
            <>
              <WizardPage
                label="Basic information"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => (
                  <FunctionBasicInformation
                    ref={innerRef}
                    app={app}
                    formik={formik}
                    isNew={isNew}
                    functionDef={functionDef}
                  />
                )}
              />
              <WizardPage
                label="Execution Role"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return (
                    <ExecutionRole ref={innerRef} app={app} formik={formik} isNew={isNew} functionDef={functionDef} />
                  );
                }}
              />
              <WizardPage
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                label="Environment variables"
=======
                label="Environment Variables"
>>>>>>> 53c727e5f... Added tags field  in Create function modal
=======
                label="Environment"
>>>>>>> f86a932a7... Edit and delete functions
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return (
                    <FunctionEnvironmentVariables
                      ref={innerRef}
                      app={app}
                      formik={formik}
                      isNew={isNew}
                      functionDef={functionDef}
                    />
                  );
<<<<<<< HEAD
=======
=======
                }}
              />
              <WizardPage
                label="Tags"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return (
                    <FunctionTags ref={innerRef} app={app} formik={formik} isNew={isNew} functionDef={functionDef} />
                  );
                }}
              />
              <WizardPage
<<<<<<< HEAD
>>>>>>> 53c727e5f... Added tags field  in Create function modal
=======
                label="Settings"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return (
                    <FunctionSettings
                      ref={innerRef}
                      app={app}
                      formik={formik}
                      isNew={isNew}
                      functionDef={functionDef}
                    />
                  );
                }}
              />
              <WizardPage
>>>>>>> f86a932a7... Edit and delete functions
                label="Network"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return <Network ref={innerRef} app={app} formik={formik} isNew={isNew} functionDef={functionDef} />;
>>>>>>> 15ef9729a... Added the VPC selector
                }}
              />
              <WizardPage
                label="Debugging and Error Handling"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => {
                  return (
                    <FunctionDebugAndErrorHandling
                      ref={innerRef}
                      app={app}
                      formik={formik}
                      isNew={isNew}
                      functionDef={functionDef}
                    />
                  );
                }}
              />
            </>
          );
        }}
      />
    );
  }
}
