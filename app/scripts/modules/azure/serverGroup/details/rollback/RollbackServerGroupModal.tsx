import * as React from 'react';

import Select from 'react-select';

import {
  IModalComponentProps,
  noop,
  NgReact,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  TaskReason,
} from '@spinnaker/core';

import { AzureModalFooter } from '../../../common/AzureModalFooter';

export interface IAzureRollbackServerGroupModalProps extends IModalComponentProps {
  application: object;
  serverGroup: object;
  disabledServerGroups: object;
}

export interface IAzureRollbackServerGroupModalState {
  taskMonitor: TaskMonitor;
  submitting: boolean;
  command: object;
}

export class AzureRollbackServerGroupModal extends React.Component<
  IAzureRollbackServerGroupModalProps,
  IAzureRollbackServerGroupModalState
> {
  public static defaultProps: Partial<IAzureRollbackServerGroupModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IAzureRollbackServerGroupModalProps) {
    const modalProps = {};
    return ReactModal.show(AzureRollbackServerGroupModal, props, modalProps);
  }

  constructor(props: IAzureRollbackServerGroupModalProps) {
    super(props);

    const { application, serverGroup } = props;

    this.state = {
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'Rollbacking your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      }),
      submitting: true,
      command: {
        interestingHealthProviderNames: [],
        rollbackType: 'EXPLICIT',
        rollbackContext: {
          rollbackServerGroupName: serverGroup.name,
          enableAndDisableOnly: true,
        },
      },
    };
  }

  private close = (args?: any) => {
    this.props.dismissModal.apply(null, args);
  };

  private submit = () => {
    const { command, taskMonitor } = this.state;
    const { serverGroup, application } = this.props;

    taskMonitor.submit(() => {
      return ReactInjector.serverGroupWriter.rollbackServerGroup(serverGroup, application, command);
    });
  };

  private filterServerGroups = disabledServerGroups => {
    const filteredDisabledServerGroups = disabledServerGroups
      .filter(disabledServerGroup => disabledServerGroup.instanceCounts.total !== 0)
      .sort((a, b) => b.name.localeCompare(a.name));

    return filteredDisabledServerGroups;
  };

  private isValid = () => {
    const restoreServerGroupName = this.state.command.rollbackContext.restoreServerGroupName;
    return restoreServerGroupName !== undefined;
  };

  private handleServerGroupChange = restoreServerGroupOption => {
    const { disabledServerGroups } = this.props;
    const newCommand = this.state.command;
    newCommand.rollbackContext.restoreServerGroupName = restoreServerGroupOption.value;
    const restoreServerGroup = this.filterServerGroups(disabledServerGroups).find(function(disabledServerGroup) {
      return disabledServerGroup.name === restoreServerGroupOption.value;
    });
    newCommand.targetSize = restoreServerGroup.capacity.max;
    this.setState({
      command: newCommand,
    });
  };

  private handleTaskReasonChange = taskReason => {
    const newCommand = this.state.command;
    newCommand.reason = taskReason;
    this.setState({
      command: newCommand,
    });
  };

  public render() {
    const { command, taskMonitor, submitting } = this.state;
    const { serverGroup, disabledServerGroups } = this.props;
    const { TaskMonitorWrapper } = NgReact;
    const isValidSG = this.isValid();
    const disabledServerGroupOptions = this.filterServerGroups(disabledServerGroups).map(disabledServerGroup => ({
      label: disabledServerGroup.name,
      value: disabledServerGroup.name,
    }));

    return (
      <div className="modal-page confirmation-modal">
        <TaskMonitorWrapper monitor={taskMonitor} />
        {submitting && (
          <form role="form">
            <div className="modal-close close-button pull-right">
              <button className="link" type="button" onClick={this.close}>
                <span className="glyphicon glyphicon-remove" />
              </button>
            </div>
            <div className="modal-header">
              <h3>Rollback {serverGroup.name}</h3>
            </div>
            <div className="modal-body confirmation-modal">
              <div className="row">
                <div className="col-sm-3 sm-label-right">Restore to</div>
                <div className="col-sm-6">
                  <Select
                    value={command.rollbackContext.restoreServerGroupName}
                    onChange={this.handleServerGroupChange}
                    options={disabledServerGroupOptions}
                  />
                </div>
              </div>
              <TaskReason reason={command.taskReason} onChange={this.handleTaskReasonChange} />
            </div>
            <AzureModalFooter
              onSubmit={this.submit}
              onCancel={this.close}
              isValid={isValidSG}
              account={serverGroup.account}
            />
          </form>
        )}
      </div>
    );
  }
}
