import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { IExecution, IExecutionStage, IExecutionStageLabelComponentProps } from 'core/domain';
import { Application } from 'core/application/application.model';
import { HoverablePopover } from 'core/presentation/HoverablePopover';
import { ExecutionBarLabel } from 'core/pipeline/config/stages/common/ExecutionBarLabel';

export interface IWaitExecutionLabelProps extends IExecutionStageLabelComponentProps {
  skipWaitComponent: React.ComponentType<{
    execution: IExecution;
    stage: IExecutionStage;
    application: Application;
  }>;
}

export interface IWaitExecutionLabelState {
  target?: any;
}

export class WaitExecutionLabel extends React.Component<IWaitExecutionLabelProps, IWaitExecutionLabelState> {
  constructor(props: IWaitExecutionLabelProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const {
      stage,
      executionMarker,
      application,
      execution,
      children,
      skipWaitComponent: SkipWaitComponent,
    } = this.props;

    if (!executionMarker) {
      return <ExecutionBarLabel {...this.props} />;
    }
    if (stage.isRunning) {
      const template = (
        <div>
          <div>
            <b>{stage.name}</b>
          </div>
          <SkipWaitComponent stage={stage.masterStage} application={application} execution={execution} />
        </div>
      );
      return <HoverablePopover template={template}>{children}</HoverablePopover>;
    }
    const tooltip = <Tooltip id={stage.id}>{stage.name}</Tooltip>;
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <span>{children}</span>
      </OverlayTrigger>
    );
  }
}
