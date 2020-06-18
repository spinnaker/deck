import * as React from 'react';
import {
  FirewallLabels,
  ReactModal,
  WizardModal,
  WizardPage,
  noop,
  TaskMonitor,
  SecurityGroupWriter,
} from '@spinnaker/core';
import { Ingress } from './components/Ingress';
import { ISecurityGroupProps, ISecurityGroupDetail } from '../define';

export interface IEditSecurityGroupProps extends ISecurityGroupProps {
  securityGroup: ISecurityGroupDetail;
}

export interface IEditSecurityGroupState {
  taskMonitor: TaskMonitor;
  isNew: boolean;
}

export class EditSecurityGroupModal extends React.Component<IEditSecurityGroupProps, IEditSecurityGroupState> {
  public static defaultProps: Partial<IEditSecurityGroupProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IEditSecurityGroupProps): Promise<ISecurityGroupDetail> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(EditSecurityGroupModal, props, modalProps);
  }

  constructor(props: IEditSecurityGroupProps) {
    super(props);
    this.state = {
      isNew: false,
      taskMonitor: null,
    };
  }

  handleSubmit = (values: ISecurityGroupDetail) => {
    const { inRules } = values;
    const { accountName, id, name, description, region } = this.props.securityGroup;
    const command = {
      application: this.props.application.name,
      cloudProvider: 'tencentcloud',
      account: accountName,
      accountName,
      credentials: accountName,
      securityGroupId: id,
      securityGroupName: name,
      name,
      securityGroupDesc: description,
      region,
      inRules,
    };
    const taskMonitor = new TaskMonitor({
      application: this.props.application,
      title: `Updating your ${FirewallLabels.get('firewall')}`,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      onTaskComplete: () => {
        this.props.application.securityGroups.refresh();
      },
    });
    taskMonitor.submit(() => {
      return SecurityGroupWriter.upsertSecurityGroup(command, this.props.application, 'Update');
    });
    this.setState({ taskMonitor });
  };

  public render() {
    const { securityGroup, dismissModal, application } = this.props;
    const { taskMonitor } = this.state;
    return (
      // @ts-ignore
      <WizardModal<ISecurityGroupDetail>
        heading={`Edit ${securityGroup.name}: ${securityGroup.region}: ${securityGroup.accountName}`}
        dismissModal={dismissModal}
        taskMonitor={taskMonitor}
        submitButtonLabel={this.state.isNew ? 'Create' : 'Update'}
        closeModal={this.handleSubmit}
        render={({ formik, nextIdx, wizard }) => {
          return (
            // @ts-ignore
            <WizardPage
              label="Ingress"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => (
                <Ingress app={application} inRules={securityGroup.inRules} formik={formik} ref={innerRef} />
              )}
            />
          );
        }}
      />
    );
  }
}
