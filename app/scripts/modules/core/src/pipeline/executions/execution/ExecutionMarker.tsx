import React from 'react';
import ReactGA from 'react-ga';
import { UISref } from '@uirouter/react';

import { IExecution, IExecutionStageSummary } from 'core/domain';
import { OrchestratedItemRunningTime } from './OrchestratedItemRunningTime';
import { duration } from 'core/utils/timeFormatters';

import { Application } from 'core/application/application.model';
import { ExecutionBarLabel } from '../../config/stages/common/ExecutionBarLabel';
import { ExecutionMarkerInformationModal } from './ExecutionMarkerInformationModal';
import { SETTINGS } from 'core/config/settings';

import './executionMarker.less';

export interface IExecutionMarkerProps {
  active?: boolean;
  application: Application;
  execution: IExecution;
  onClick: (stageIndex: number) => void;
  previousStageActive?: boolean;
  stage: IExecutionStageSummary;
  width: string;
  manualJudgment: any;
  onWait?: (id: string, name: string) => void;
}

export interface IExecutionMarkerState {
  duration: string;
  hydrated: boolean;
  showingExecutionMarkerInformationModal: boolean;
}

export class ExecutionMarker extends React.Component<IExecutionMarkerProps, IExecutionMarkerState> {
  private runningTime: OrchestratedItemRunningTime;

  constructor(props: IExecutionMarkerProps) {
    super(props);

    const { stage, execution } = props;

    this.state = {
      duration: duration(stage.runningTimeInMs),
      hydrated: execution.hydrated,
      showingExecutionMarkerInformationModal: false,
    };
  }

  public componentDidMount() {
    this.runningTime = new OrchestratedItemRunningTime(this.props.stage, (time: number) =>
      this.setState({ duration: duration(time) }),
    );
  }

  public componentWillReceiveProps(nextProps: IExecutionMarkerProps) {
    this.runningTime.checkStatus(nextProps.stage);
  }

  public componentWillUnmount() {
    this.runningTime.reset();
  }

  private handleStageClick = (): void => {
    ReactGA.event({ category: 'Pipeline', action: 'Stage clicked (bar)' });
    this.props.onClick(this.props.stage.index);
  };

  private handleStageInformationClick = (event: any): void => {
    ReactGA.event({ category: 'Pipeline', action: 'Stage show context menu (bar)' });
    event.preventDefault();
    event.stopPropagation();
    this.showExecutionMarkerInformationModal();
  };

  private showExecutionMarkerInformationModal = () => {
    this.setState({
      showingExecutionMarkerInformationModal: true,
    });
  };

  private hideExecutionMarkerInformationModal = () => {
    this.setState({
      showingExecutionMarkerInformationModal: false,
    });
  };

  private manualJudgmentStatus = (stageStatus: string, manualJudgment: any) => {
    let status = '';
    if (manualJudgment !== undefined && manualJudgment.length && stageStatus === 'running') {
      const existStages = this.props.stage.stages.filter((stage) => stage.status.toLowerCase() === 'running');
      existStages.forEach(({ context }) => {
        if (
          manualJudgment.find((element: any) => element.id === context.executionId) ||
          manualJudgment.find((element: any) => element.currentChild && element.currentChild === context.executionId)
        ) {
          status = 'waiting';
        }
      });
    } else {
      status = stageStatus;
    }
    return status !== '' ? status : stageStatus;
  };

  private redirectLeafNode = (type: string, manualJudgment: any, contextExecutionId: string): any => {
    if (manualJudgment !== undefined) {
      const leafnodeObj = this.props.manualJudgment[contextExecutionId];
      if (leafnodeObj) {
        return this.redirectLeafNode(type, leafnodeObj, leafnodeObj[0].currentChild);
      } else {
        return this.fetchLeafNodeParameter(type, manualJudgment, contextExecutionId);
      }
    }
  };

  private fetchLeafNodeParameter = (type: string, manualJudgment: any, contextExecutionId: string) => {
    let leafNodeVal = '';
    const leafNodeIndex = manualJudgment.length - 1;
    if (
      manualJudgment[leafNodeIndex].currentChild === contextExecutionId ||
      manualJudgment[leafNodeIndex].id === contextExecutionId
    ) {
      if (type === 'application') {
        leafNodeVal = manualJudgment[leafNodeIndex].app;
      } else {
        leafNodeVal = manualJudgment[leafNodeIndex].id;
      }
    }
    return leafNodeVal;
  };

  private leafChildInCurrentApplication = (currentExecutionId: string, parentExecutionId: string): boolean => {
    const manualJudgementObj = this.props.manualJudgment;
    if (manualJudgementObj[currentExecutionId]) {
      let leafNodeInSameApplication = true;
      for (let i = 0; i < manualJudgementObj[currentExecutionId].length; i++) {
        leafNodeInSameApplication = this.leafChildInCurrentApplication(
          manualJudgementObj[currentExecutionId][i].id,
          currentExecutionId,
        );
        if (leafNodeInSameApplication == false) return leafNodeInSameApplication;
      }
      return leafNodeInSameApplication;
    } else {
      const stage = manualJudgementObj[parentExecutionId].filter(
        (stage: { id: string; currentChild: string }) =>
          stage.currentChild === currentExecutionId || stage.id === currentExecutionId,
      );
      return stage[0].app ? false : true;
    }
  };

  public render() {
    const { stage, application, execution, active, previousStageActive, width, manualJudgment, onWait } = this.props;
    const stageType = (stage.activeStageType || stage.type).toLowerCase(); // support groups
    const PIPELINE_WAITING =
      this.manualJudgmentStatus(stage.status.toLowerCase(), manualJudgment[execution.id]) === 'waiting';
    const markerClassName = [
      stage.type !== 'group' ? 'clickable' : '',
      'stage',
      'execution-marker',
      `stage-type-${stageType}`,
      `execution-marker-${this.manualJudgmentStatus(stage.status.toLowerCase(), manualJudgment[execution.id])}`,
      active ? 'active' : '',
      previousStageActive ? 'after-active' : '',
      stage.isRunning ? 'glowing' : '',
      stage.requiresAttention ? 'requires-attention' : '',
    ].join(' ');

    const TooltipComponent = stage.useCustomTooltip ? stage.labelComponent : ExecutionBarLabel;
    const MarkerIcon = stage.markerIcon;
    const showInfoIcon =
      SETTINGS.feature.executionMarkerInformationModal &&
      stage.status.toLowerCase() === 'terminal' &&
      stage.type === 'pipeline';
    const stageContents = PIPELINE_WAITING ? (
      this.leafChildInCurrentApplication(stage.stages[0].context.executionId, execution.id) ? (
        <div
          className={markerClassName}
          style={{ width, backgroundColor: stage.color }}
          onClick={() => onWait(stage.stages[0].context.executionId, stage.stages[0].context.executionName)}
        >
          <span className="horizontal center middle">
            <span className="duration">waiting</span>
            {<i className="fa fa-clock"></i>}
          </span>
        </div>
      ) : (
        <div className={markerClassName} style={{ width, backgroundColor: stage.color }}>
          <UISref
            to="home.applications.application.pipelines.executionDetails.execution"
            params={{
              application: this.redirectLeafNode(
                'application',
                manualJudgment[execution.id],
                stage.stages[0].context.executionId,
              ),
              executionId: this.redirectLeafNode(
                'executionId',
                manualJudgment[execution.id],
                stage.stages[0].context.executionId,
              ),
              executionParams: { application: application.name, executionId: execution.id },
            }}
          >
            <a target="_self" style={{ textDecoration: 'none', color: 'black' }}>
              <span className="horizontal center middle">
                <span className="duration">waiting </span>
                {<i className="fa fa-clock"></i>}
              </span>
            </a>
          </UISref>
        </div>
      )
    ) : (
      <div className={markerClassName} style={{ width, backgroundColor: stage.color }} onClick={this.handleStageClick}>
        <span className="horizontal center middle">
          <MarkerIcon stage={stage} />
          <span className="duration">{this.state.duration}</span>
          {showInfoIcon && <i className="fa fa-info-circle" onClick={this.handleStageInformationClick} />}
        </span>
      </div>
    );
    return (
      <span>
        <TooltipComponent application={application} execution={execution} stage={stage} executionMarker={true}>
          {stageContents}
        </TooltipComponent>
        {this.state.showingExecutionMarkerInformationModal && (
          <ExecutionMarkerInformationModal
            executionId={execution.id}
            onClose={this.hideExecutionMarkerInformationModal}
            stageId={execution.stageSummaries[stage.index].id}
          />
        )}
      </span>
    );
  }
}
