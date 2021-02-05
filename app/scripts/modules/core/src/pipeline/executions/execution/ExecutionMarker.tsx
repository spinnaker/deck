import React from 'react';
import ReactGA from 'react-ga';
import { UISref } from '@uirouter/react';

import { IExecution, IExecutionStageSummary, IManualJudgment, IManualJudgmentConfig } from 'core/domain';
import { OrchestratedItemRunningTime } from './OrchestratedItemRunningTime';
import { duration } from 'core/utils/timeFormatters';

import { Application } from 'core/application/application.model';
import { ExecutionBarLabel } from '../../config/stages/common/ExecutionBarLabel';
import { ExecutionMarkerInformationModal } from './ExecutionMarkerInformationModal';
import { SETTINGS } from 'core/config/settings';

import './executionMarker.less';
import { isEmpty } from 'lodash';

export interface IExecutionMarkerProps {
  active?: boolean;
  application: Application;
  execution: IExecution;
  onClick: (stageIndex: number) => void;
  previousStageActive?: boolean;
  stage: IExecutionStageSummary;
  width: string;
  manualJudgment?: IManualJudgment;
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

  private manualJudgmentStatus = (stageStatus: string, manualJudgment: IManualJudgmentConfig[]) => {
    let status = stageStatus;
    if (manualJudgment !== undefined && manualJudgment.length && stageStatus === 'running') {
      this.props.stage.stages
        .filter(
          (stage) =>
            stage.status.toLowerCase() === 'running' &&
            stage.type === 'pipeline' &&
            this.leafNodeExist(stage.context.executionId, manualJudgment),
        )
        .forEach((_stage) => (status = 'waiting'));
    }
    return status;
  };

  private leafNodeExist = (
    executionContextId: string,
    manualJudgment: IManualJudgmentConfig[],
  ): IManualJudgmentConfig => {
    const nestedLeafnodeObj = this.props.manualJudgment[executionContextId];
    const leafNodeObj = manualJudgment.find(
      (leafnode: IManualJudgmentConfig) =>
        leafnode.currentChild === executionContextId || leafnode.id === executionContextId,
    );
    if (!nestedLeafnodeObj && !leafNodeObj) return null;
    if (nestedLeafnodeObj) {
      return this.leafNodeExist(nestedLeafnodeObj[0].pipelineId ?? nestedLeafnodeObj[0].id, nestedLeafnodeObj);
    } else if (leafNodeObj) {
      return leafNodeObj;
    }
    return null;
  };

  private redirectLeafNode = (
    type: string,
    manualJudgment: IManualJudgmentConfig[],
    contextExecutionId: string,
  ): any => {
    if (manualJudgment !== undefined) {
      const leafnode = this.leafNodeExist(contextExecutionId, manualJudgment);
      if (leafnode) {
        return this.fetchLeafNodeParameter(type, leafnode);
      }
    }
  };

  private fetchLeafNodeParameter = (type: string, leafNodeObject: IManualJudgmentConfig) => {
    const appName = leafNodeObject?.app ?? this.props.application.name;
    return isEmpty(leafNodeObject) ? '' : type === 'application' ? appName : leafNodeObject.id;
  };

  public render() {
    const { stage, application, execution, active, previousStageActive, width, manualJudgment } = this.props;
    const stageType = (stage.activeStageType || stage.type).toLowerCase(); // support groups
    const PIPELINE_STATUS = this.manualJudgmentStatus(stage.status.toLowerCase(), manualJudgment[execution.id]);
    const markerClassName = [
      stage.type !== 'group' ? 'clickable' : '',
      'stage',
      'execution-marker',
      `stage-type-${stageType}`,
      `execution-marker-${PIPELINE_STATUS}`,
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
    const stageContents =
      PIPELINE_STATUS === 'waiting' ? (
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
            <a target="_self" className="execution-waiting-link">
              <span className="horizontal center middle">
                <span className="duration">waiting </span>
                {<i className="fa fa-clock execution-waiting-fa"></i>}
              </span>
            </a>
          </UISref>
        </div>
      ) : (
        <div
          className={markerClassName}
          style={{ width, backgroundColor: stage.color }}
          onClick={this.handleStageClick}
        >
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
