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
  scope: object;
  application: object;
  serverGroup: object;
  disabledServerGroups: object;
}

export interface IAzureRollbackServerGroupModalState {
  taskMonitor: TaskMonitor;
  submitting: boolean;
  restoreServerGroupName: string;
  taskReason: string;
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

    const { scope, application, serverGroup, disabledServerGroups } = props;

    scope.command = {
      interestingHealthProviderNames: [],
      rollbackType: 'EXPLICIT',
      rollbackContext: {
        rollbackServerGroupName: serverGroup.name,
        enableAndDisableOnly: true,
      },
    };

    this.state = {
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'Rollbacking your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      }),
      submitting: true,
    };
  }

  private close = (args?: any) => {
    this.props.dismissModal.apply(null, args);
  };

  private submit = () => {
    scope.command.rollbackContext.restoreServerGroupName = this.state.restoreServerGroupName.value;
    scope.command.reason = this.state.taskReason;

    this.state.taskMonitor.submit(() => {
      const restoreServerGroup = this.filterServerGroups(this.props.disabledServerGroups).find(function(
        disabledServerGroup,
      ) {
        return disabledServerGroup.name === scope.command.rollbackContext.restoreServerGroupName;
      });
      scope.command.targetSize = restoreServerGroup.capacity.max;
      return ReactInjector.serverGroupWriter.rollbackServerGroup(serverGroup, application, scope.command);
    });
  };

  private filterServerGroups = disabledServerGroups => {
    const filteredDisabledServerGroups = disabledServerGroups
      .filter(disabledServerGroup => disabledServerGroup.instanceCounts.total !== 0)
      .sort((a, b) => b.name.localeCompare(a.name));

    return filteredDisabledServerGroups;
  };

  private isValid = () => {
    const restoreServerGroupName = this.state.restoreServerGroupName;
    return restoreServerGroupName !== undefined;
  };

  private handleServerGroupChange = restoreServerGroupName => {
    this.setState({ restoreServerGroupName });
  };

  private handleTaskReasonChange = taskReason => {
    this.setState({ taskReason });
  };

  public render() {
    const { restoreServerGroupName, taskReason } = this.state;
    const { TaskMonitorWrapper } = NgReact;
    const isValidSG = this.isValid();
    const disabledServerGroupOptions = this.filterServerGroups(this.props.disabledServerGroups).map(
      disabledServerGroup => ({
        label: disabledServerGroup.name,
        value: disabledServerGroup.name,
      }),
    );
    return (
      <div className="modal-page confirmation-modal">
        <TaskMonitorWrapper monitor={this.state.taskMonitor} />
        {this.state.submitting && (
          <form role="form">
            <div className="modal-close close-button pull-right">
              <button className="link" type="button" onClick={this.close}>
                <span className="glyphicon glyphicon-remove" />
              </button>
            </div>
            <div className="modal-header">
              <h3>Rollback {this.props.serverGroup.name}</h3>
            </div>
            <div className="modal-body confirmation-modal">
              <div className="row">
                <div className="col-sm-3 sm-label-right">Restore to</div>
                <div className="col-sm-6">
                  <Select
                    value={restoreServerGroupName}
                    onChange={this.handleServerGroupChange}
                    options={disabledServerGroupOptions}
                  />
                </div>
              </div>
              <TaskReason reason={taskReason} onChange={this.handleTaskReasonChange} />
            </div>
            <AzureModalFooter
              onSubmit={this.submit}
              onCancel={this.close}
              isValid={isValidSG}
              account={this.props.serverGroup.account}
            />
          </form>
        )}
      </div>
    );
  }
}
