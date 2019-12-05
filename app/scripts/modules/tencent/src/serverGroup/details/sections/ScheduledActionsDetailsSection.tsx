import * as React from 'react';

import { CollapsibleSection, ModalInjector, Tooltip } from '@spinnaker/core';

import { IScalingProcess } from 'tencent/domain';
import { AutoScalingProcessService } from '../scalingProcesses/AutoScalingProcessService';

import { ITencentServerGroupDetailsSectionProps } from './ITencentServerGroupDetailsSectionProps';
import { ScheduledAction } from '../scheduledAction/ScheduledAction';

export interface IScheduledActionsDetailsSectionState {
  scheduledActionsDisabled: boolean;
}

export class ScheduledActionsDetailsSection extends React.Component<
  ITencentServerGroupDetailsSectionProps,
  IScheduledActionsDetailsSectionState
> {
  constructor(props: ITencentServerGroupDetailsSectionProps) {
    super(props);

    this.state = this.getState(props);
  }

  private getState(props: ITencentServerGroupDetailsSectionProps): IScheduledActionsDetailsSectionState {
    const { serverGroup } = props;

    const autoScalingProcesses: IScalingProcess[] = AutoScalingProcessService.normalizeScalingProcesses(serverGroup);
    const scheduledActionsDisabled =
      serverGroup.scheduledActions.length > 0 &&
      autoScalingProcesses
        .filter(p => !p.enabled)
        .some(p => ['Launch', 'Terminate', 'ScheduledAction'].includes(p.name));

    return { scheduledActionsDisabled };
  }

  private editScheduledActions = (): void => {
    ModalInjector.modalService.open({
      templateUrl: require('../scheduledAction/editScheduledActions.modal.html'),
      controller: 'tencentEditScheduledActionsCtrl as ctrl',
      size: 'lg',
      resolve: {
        application: () => this.props.app,
        serverGroup: () => this.props.serverGroup,
      },
    });
  };

  public componentWillReceiveProps(nextProps: ITencentServerGroupDetailsSectionProps): void {
    this.setState(this.getState(nextProps));
  }

  public render(): JSX.Element {
    const { serverGroup } = this.props;
    const { scheduledActionsDisabled } = this.state;

    return (
      <CollapsibleSection
        cacheKey="Scheduled Actions"
        heading={({ chevron }) => (
          <h4 className="collapsible-heading">
            {chevron}
            <span>
              {scheduledActionsDisabled && (
                <Tooltip value="Some scaling processes are disabled that may prevent scheduled actions from working">
                  <span className="fa fa-exclamation-circle warning-text" />
                </Tooltip>
              )}
              Scheduled Actions
            </span>
          </h4>
        )}
      >
        {serverGroup.scheduledActions.map((action, index) => (
          <ScheduledAction key={index} action={action} serverGroup={serverGroup} application={this.props.app} />
        ))}

        {serverGroup.scheduledActions.length > 0 && (
          <p>
            <strong>Note:</strong> Schedules are evaluated in UTC.
          </p>
        )}
        {serverGroup.scheduledActions.length === 0 && <p>No Scheduled Actions are configured for this server group.</p>}
        <a className="clickable" onClick={this.editScheduledActions}>
          Edit Scheduled Actions
        </a>
      </CollapsibleSection>
    );
  }
}
