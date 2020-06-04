import React from 'react';

import { IExecution, IPipeline, IExecutionStageSummary } from 'core/domain';
import { relativeTime, timestamp, duration } from 'core/utils';
import { Spinner } from 'core';
import { PipelineGraph } from '../../config/graph/PipelineGraph';

import { ExecutionInformationPopoverState } from './ExecutionInformationPopoverState';

import './executionMarkerInformationPopover.less';

export interface IExecutionErrorLocatorProps {
  target: Element;
  executionId: string;
  stageId: string;
  onClose: Function;
}

export interface IExecutionLocatorState {
  pipelineConfigDetails: IPipeline;
  executionDetails: IExecution;
  failedInApplication: string;
  link: string;
  showPipelineGraph: boolean;
  stageDetails: any;
}

export class ExecutionMarkerInformationPopover extends React.PureComponent<
  IExecutionErrorLocatorProps,
  IExecutionLocatorState
> {
  allExecutions: any[];
  arrowLeftOffset: number;
  childExecution: any;
  childPipelineConfig: any;
  childTerminalPipelineStage: any;
  informationIconHeight: number;
  informationPopoverContainerScrollTop: number;
  informationState: ExecutionInformationPopoverState;
  popoverHalfWidth: number;
  popoverWidth: number;
  constructor(props: IExecutionErrorLocatorProps) {
    super(props);
    this.state = {
      executionDetails: null,
      failedInApplication: null,
      link: null,
      pipelineConfigDetails: null,
      showPipelineGraph: false,
      stageDetails: null,
    };

    const target = document.querySelector('.all-execution-groups');

    if (target) {
      target.removeEventListener('scroll', this.onScroll);
      target.addEventListener('scroll', this.onScroll);
    }
    window.removeEventListener('resize', this.onResize);
    window.addEventListener('resize', this.onResize);

    this.allExecutions = [];
    this.arrowLeftOffset = 404;
    this.informationIconHeight = 29;
    this.informationPopoverContainerScrollTop = null;
    this.informationState = new ExecutionInformationPopoverState();
    this.popoverHalfWidth = 400;
  }

  public componentDidMount() {
    this.getPipelineLink(this.props.stageId, this.props.executionId);
  }

  public componentWillUnmount() {
    const target = document.querySelector('.all-execution-groups');
    if (target) {
      target.removeEventListener('scroll', this.onScroll);
    }
    window.removeEventListener('resize', this.onResize);
  }

  private onScroll = () => {
    this.updatePosition('scroll');
  };

  private onResize = () => {
    this.updatePosition('resize');
  };

  private updatePosition = (movement: string) => {
    const { top } = this.props.target.getBoundingClientRect();
    const targetTop = top - this.informationIconHeight;
    const informationPopoverContainer = document.querySelector(
      '.execution-marker-information-popover > div.popover',
    ) as HTMLDivElement;

    if (movement === 'scroll') {
      const container = document.querySelector('.all-execution-groups') as HTMLDivElement;
      const containerTop = container.getBoundingClientRect().top;

      if (targetTop < containerTop) {
        this.props.onClose();
      }

      informationPopoverContainer.style.top = targetTop + 'px';
      this.informationPopoverContainerScrollTop = targetTop;
    } else if (movement === 'resize') {
      const targetClassname = this.props.target.className.replace(/\s/g, '.');
      const targetContainer = document.querySelector(
        `.${targetClassname}[data-id="${this.props.executionId}_${this.props.stageId}"]`,
      );
      const targetClientRect = targetContainer.getBoundingClientRect();
      const newLeft = this.windowCanFit();
      const arrowElement = informationPopoverContainer.querySelector('.arrow') as HTMLDivElement;
      let left = targetClientRect.left;

      if (newLeft > 0) {
        arrowElement.style.left = this.arrowLeftOffset + newLeft + 'px';
        left -= newLeft;
      } else {
        arrowElement.style.left = this.popoverHalfWidth + 'px';
      }

      informationPopoverContainer.style.top = targetClientRect.top - this.informationIconHeight + 'px';
      informationPopoverContainer.style.left = left - this.popoverHalfWidth + 'px';
    }
  };

  private getPipelineLink = async (stageId: string, executionId: string): Promise<any> => {
    // get the current execution id is from ExecutionMarker.tsx
    const currentExecution = await this.informationState.getExecution(executionId);
    let stageIndex;

    // get the current stage in the exeuction index is from ExecutionMarker.tsx
    const currentStage = currentExecution.stageSummaries.find((stage: IExecutionStageSummary, index: number) => {
      if (stage.id === stageId) {
        // store the index for our pipeline graph
        stageIndex = index;
        return stage;
      }

      return null;
    });
    // get the current configuration for this execution
    const currentPipelineConfig = await this.informationState.getPipelineConfig(
      currentExecution.application,
      currentExecution.pipelineConfigId,
    );

    // save this for rendering pipelines
    this.allExecutions.push({
      execution: currentExecution,
      stageId,
      stageIndex,
    });

    // get the child execution aka clicking View Pipeline Details
    const childExecution = await this.informationState.getExecution(currentStage.masterStage.context.executionId);
    const childTerminalStage = childExecution.stageSummaries.find((stage: IExecutionStageSummary, index: number) => {
      if (stage.status.toLocaleLowerCase() === 'terminal') stageIndex = index;

      return stage.status.toLowerCase() === 'terminal';
    });
    const childTerminalPipelineStage = childExecution.stageSummaries.find(
      (stage: IExecutionStageSummary) => stage.status.toLowerCase() === 'terminal' && stage.type === 'pipeline',
    );
    // get the current configuration for this execution
    const childPipelineConfig = await this.informationState.getPipelineConfig(
      childExecution.application,
      childExecution.pipelineConfigId,
    );

    if (childExecution && !childTerminalPipelineStage) {
      this.childExecution = childExecution;
      this.childPipelineConfig = childPipelineConfig;

      // save this for rendering pipelines
      this.allExecutions.push({
        execution: childExecution,
        stageId,
        stageIndex,
      });
    }

    if (childTerminalPipelineStage) {
      this.getPipelineLink(childTerminalPipelineStage.id, childExecution.id);
      this.childTerminalPipelineStage = childTerminalPipelineStage;
    } else {
      // now that we are complete let's fix up the allExecutions array
      // we are using allExecutions as a breadcrumb so reverse them then pop the first one since there user is already at the first one
      this.allExecutions.reverse();
      this.allExecutions.pop();

      this.setState({
        pipelineConfigDetails: this.childPipelineConfig || currentPipelineConfig,
        executionDetails: this.childExecution || currentExecution,
        failedInApplication: currentStage.masterStage.context.application,
        link: `/#/applications/${currentStage.masterStage.context.application}/executions/details/${currentStage.masterStage.context.executionId}?stage=${this.allExecutions[0].stageIndex}&step=0`,
        stageDetails: childTerminalStage || this.childTerminalPipelineStage || currentStage,
      });
    }
  };

  private windowCanFit = () => {
    const { left, width } = this.props.target.getBoundingClientRect();
    return this.popoverHalfWidth + left + width - window.innerWidth;
  };

  private showPipelineGraph = () => {
    this.setState({ showPipelineGraph: true });
  };

  private hidePipelineGraph = () => {
    this.setState({ showPipelineGraph: false });
  };

  private getMaxHeight = (top: number) => {
    const height = window.innerHeight - top - 100;

    // user can open popover near the bottom of the screen
    // always give the some room
    if (height < 400) {
      return 400;
    }

    return height;
  };

  private toggleParameters = (target: any) => {
    const container = target.nextElementSibling;
    const icon = target.children[0];

    if (icon.classList.contains('fa-chevron-right')) {
      icon.classList.remove('fa-chevron-right');
      icon.classList.add('fa-chevron-down');
    } else {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-right');
    }

    if (container.classList.contains('closed')) {
      container.classList.remove('closed');
      container.classList.add('opened');
    } else {
      container.classList.remove('opened');
      container.classList.add('closed');
    }
  };

  private goToPipeline = (item: any) => {
    const { stageIndex } = item;
    const { application, id } = item.execution;

    window.open(`/#/applications/${application}/executions/details/${id}?stage=${stageIndex}&step=0`, '_blank');
  };

  public render(): React.ReactElement<HTMLDivElement> {
    const { executionDetails, failedInApplication, link, pipelineConfigDetails, stageDetails } = this.state;
    const { left, top } = this.props.target.getBoundingClientRect();
    const targetTop = this.informationPopoverContainerScrollTop || top - this.informationIconHeight;
    let targetLeft = left - this.popoverHalfWidth;
    const newLeft = this.windowCanFit();
    let arrowLeft = this.arrowLeftOffset;
    const maxHeight = this.getMaxHeight(top);

    if (newLeft > 0) {
      targetLeft -= newLeft;
      arrowLeft = this.arrowLeftOffset + newLeft;
    }

    const content = this.state.showPipelineGraph ? (
      <div className="">
        {this.allExecutions.map(item => {
          return (
            <div className="execution-graph">
              {item.execution.application} - {item.execution.name}
              <PipelineGraph
                key={item.execution.id}
                execution={item.execution}
                onNodeClick={() => {}}
                viewState={{
                  activeStageId: item.stageIndex,
                  activeSubStageId: null,
                  canTriggerPipelineManually: false,
                  canConfigure: false,
                }}
              />
            </div>
          );
        })}
      </div>
    ) : (
      <div>
        {!executionDetails ? (
          <div>
            <Spinner size="medium" />
          </div>
        ) : (
          <div className="information-details">
            <div className="pipeline-name bottom-margin">
              {pipelineConfigDetails ? pipelineConfigDetails.name : '-'}
            </div>
            <div style={{ fontWeight: 'bold' }}>PIPELINE</div>
            <div className="bottom-margin">
              <div>{`[${executionDetails.authentication.user}] (${executionDetails.user})`}</div>
              <div>{relativeTime(executionDetails.startTime || executionDetails.buildTime)}</div>
              <div>
                Status: <span className="status">{executionDetails.status}</span> by parent pipeline{' '}
                {timestamp(executionDetails.trigger.parentExecution.buildTime)}
              </div>
            </div>
            <div className="bottom-margin parameters">
              <span
                className="clickable"
                onClick={event => {
                  this.toggleParameters(event.target);
                }}
              >
                <i className="fa fa-chevron-right"></i> View all Parameters (
                {Object.keys(executionDetails.trigger.parameters).length})
              </span>
              <div className="view-parameters closed">
                {Object.keys(executionDetails.trigger.parameters).map(key => (
                  <span>
                    {key}: {executionDetails.trigger.parameters[key]}
                  </span>
                ))}
              </div>
            </div>
            {stageDetails && (
              <div className="bottom-margin information-stage-details">
                <div>STAGE DETAILS</div>
                <div>Name: {stageDetails.name}</div>
                <div>Duration: {duration(stageDetails.endTime - stageDetails.startTime)}</div>
                <div>Exception: {stageDetails.getErrorMessage || 'No message available'}</div>
                <div>
                  Pipeline Execution History <span className="information-history-note">(Decending order)</span>
                  <table className="information-pipeline-execution-history">
                    <thead>
                      <tr>
                        <th></th>
                        <th>APPLICATION</th>
                        <th>PIPELINE NAME</th>
                        <th>STAGE</th>
                        <th>STATUS</th>
                        <th>DURATION</th>
                      </tr>
                    </thead>
                    <tbody className="information-section">
                      {this.allExecutions.map((item: any, index: number) => {
                        return (
                          <tr
                            onClick={() => {
                              this.goToPipeline(item);
                            }}
                          >
                            <td>{index === 0 && <i className="fa fa-circle"></i>}</td>
                            <td className="information-app">{item.execution.application}</td>
                            <td className="information-execution">{item.execution.name}</td>
                            <td>{item.execution.stageSummaries[item.stageIndex].name}</td>
                            <td className="information-stage-status">
                              <span className="information-terminal-stage">
                                {item.execution.stageSummaries[item.stageIndex].status}
                              </span>
                            </td>
                            <td>{duration(item.execution.endTime - item.execution.startTime)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {link && (
          <div className="execution-marker-information-popver-footer">
            <div>
              <button className="btn btn-link graph-all-buttons" aria-disabled="false" onClick={this.showPipelineGraph}>
                Show Pipeline Execution History Graphs
              </button>
            </div>
            <div>
              <a href={link} className="btn btn-xs btn-link" aria-disabled="false">
                Link to the Last Failed Execution Stage
              </a>
            </div>
          </div>
        )}
      </div>
    );
    const title = this.state.showPipelineGraph ? (
      <span>
        <span className="clickable information-back">
          <i
            className="fa fa-chevron-left"
            onClick={() => {
              this.hidePipelineGraph();
            }}
          ></i>
        </span>
        Pipeline Execution History Graphs <span className="information-history-note">(Decending order)</span>
      </span>
    ) : (
      <span>
        {failedInApplication ? failedInApplication : '-'}
        <span className="pull-right clickable">
          <i
            className="fa fa-times"
            onClick={() => {
              this.props.onClose();
            }}
          ></i>
        </span>
      </span>
    );

    return (
      <div className="execution-marker-information-popover">
        <div className="popover fade in show bottom" style={{ position: 'absolute', top: targetTop, left: targetLeft }}>
          <div className="arrow" style={{ left: arrowLeft }}></div>
          <h3 className="popover-title">{title}</h3>
          <div className="popover-content" style={{ maxHeight }}>
            {content}
          </div>
        </div>
      </div>
    );
  }
}
