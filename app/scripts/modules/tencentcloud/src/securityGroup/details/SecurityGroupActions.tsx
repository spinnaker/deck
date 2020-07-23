import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  Application,
  ConfirmationModalService,
  FirewallLabels,
  SecurityGroupWriter,
  ISecurityGroupJob,
  SETTINGS,
  NgReact,
  ReactInjector,
} from '@spinnaker/core';
import { ISecurityGroupDetail } from '../interface';
import { EditSecurityGroupModal } from '../configure/EditSecurityGroup';

export interface IActionsProps {
  application: Application;
  securityGroup: ISecurityGroupDetail;
}

export class SecurityGroupActions extends React.Component<IActionsProps> {
  constructor(props: IActionsProps) {
    super(props);
  }

  public handleEdit = (): void => {
    EditSecurityGroupModal.show(this.props);
  };

  private entityTagUpdate = (): void => {
    this.props.application.securityGroup.refresh();
  };

  public handleDelete = (): void => {
    const { application, securityGroup } = this.props;
    const {
      name,
      provider: cloudProvider,
      region,
      id: securityGroupId,
      accountId: accountName,
      credentials,
    } = securityGroup;

    let isRetry = false;

    const taskMonitor = {
      application,
      title: 'Deleting ' + name,
      onTaskRetry: () => {
        isRetry = true;
      },
      onTaskComplete: () => {
        ReactInjector.$state.go('^', { allowModalToStayOpen: true }, { location: 'replace' });
      },
    };

    const submitMethod = () => {
      const params = ({
        cloudProvider,
        region,
        securityGroupId,
        accountName,
        credentials,
      } as unknown) as ISecurityGroupJob;
      if (isRetry) {
        Object.assign(params, {
          removeDependencies: true,
        });
      }
      return SecurityGroupWriter.deleteSecurityGroup(securityGroup, application, params);
    };

    ConfirmationModalService.confirm({
      header: 'Really delete ' + name + '?',
      buttonText: 'Delete ' + name,
      account: accountName,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
      retryBody: `<div><p>Retry deleting the ${FirewallLabels.get(
        'firewall',
      )} and revoke any dependent ingress rules?</p><p>Any instance or load balancer associations will have to removed manually.</p></div>`,
    });
  };

  public render() {
    const { application, securityGroup } = this.props;

    return (
      <div style={{ display: 'inline-block' }}>
        <Dropdown className="dropdown" id="function-actions-dropdown">
          <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
            <span>{FirewallLabels.get('Firewall')} Actions</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <li>
              <a className="clickable" onClick={this.handleEdit}>
                Edit {FirewallLabels.get('Firewall')}
              </a>
            </li>
            <li>
              <a className="clickable" onClick={this.handleDelete}>
                Delete {FirewallLabels.get('Firewall')}
              </a>
            </li>
            {SETTINGS && SETTINGS.feature.entityTags && (
              <NgReact.AddEntityTagLinks
                component={securityGroup}
                application={application}
                entityType="securityGroup"
                onUpdate={this.entityTagUpdate}
              />
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
