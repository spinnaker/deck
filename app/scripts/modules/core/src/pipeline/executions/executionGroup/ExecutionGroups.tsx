import React from 'react';
import { Subscription } from 'rxjs';

import { IQService, ITimeoutService } from 'angular';
import { StateService } from '@uirouter/core';
import { SETTINGS } from '../../../config/settings';

import { Application } from 'core/application/application.model';
import { ExecutionGroup } from './ExecutionGroup';
import { IExecution, IExecutionGroup } from 'core/domain';
import { Observable } from 'rxjs';
import { ReactInjector } from 'core/reactShims';
import { ExecutionState } from 'core/state';
import { ExecutionFilterService } from '../../filter/executionFilter.service';
import { ExecutionService } from '../../service/execution.service';
import { BannerContainer } from 'core/banner';

import './executionGroups.less';

export interface IExecutionGroupsProps {
  application: Application;
}

export interface IExecutionGroupsState {
  groups: IExecutionGroup[];
  showingDetails: boolean;
  container?: HTMLDivElement; // need to pass the container down to children to use as root for IntersectionObserver
}

export class ExecutionGroups extends React.Component<IExecutionGroupsProps, IExecutionGroupsState> {
  private applicationRefreshUnsubscribe: () => void;
  private groupsUpdatedSubscription: Subscription;
  private stateChangeSuccessSubscription: Subscription;
  private executionService: ExecutionService;

  constructor(
    props: IExecutionGroupsProps,
    private $q: IQService,
    private $state: StateService,
    private $timeout: ITimeoutService,
  ) {
    super(props);
    const { stateEvents } = ReactInjector;
    this.executionService = new ExecutionService(this.$q, this.$state, this.$timeout);
    this.state = {
      groups: ExecutionState.filterModel.asFilterModel.groups,
      showingDetails: ReactInjector.$state.includes('**.execution'),
    };

    this.applicationRefreshUnsubscribe = props.application.executions.onRefresh(null, () => {
      ExecutionFilterService.updateExecutionGroups(props.application);
    });

    this.groupsUpdatedSubscription = ExecutionFilterService.groupsUpdatedStream.subscribe(() => {
      const newGroups = ExecutionState.filterModel.asFilterModel.groups;
      const { groups } = this.state;
      if (newGroups.length !== groups.length || newGroups.some((g, i) => groups[i] !== g)) {
        this.setState({ groups: newGroups });
      }
    });
    this.stateChangeSuccessSubscription = stateEvents.stateChangeSuccess.subscribe(() => {
      const detailsShown = this.showingDetails();
      if (detailsShown !== this.state.showingDetails) {
        this.setState({ showingDetails: detailsShown });
      }
    });
  }

  private showingDetails(): boolean {
    const { executionId } = ReactInjector.$stateParams;
    // showingDetails() is just used to set a class ('.showing-details') on the wrapper around the execution groups.
    // the effect of this class is that, when an execution is deep linked, all the other execution groups have a partial
    // opacity (except when hovering over them).
    // Here, we are checking if there is an executionId deep linked - and also confirming it's actually present
    // on screen. If not, we will not apply the '.showing-details' class to the wrapper.
    if (!executionId || this.state.groups.every((g) => g.executions.every((e) => e.id !== executionId))) {
      return false;
    }
    return ReactInjector.$state.includes('**.execution');
  }

  private setContainer = (container: HTMLDivElement) => {
    if (this.state.container !== container) {
      this.setState({ container });
    }
  };

  public componentWillUnmount(): void {
    if (this.applicationRefreshUnsubscribe) {
      this.applicationRefreshUnsubscribe();
      this.applicationRefreshUnsubscribe = undefined;
    }
    if (this.groupsUpdatedSubscription) {
      this.groupsUpdatedSubscription.unsubscribe();
    }
    if (this.stateChangeSuccessSubscription) {
      this.stateChangeSuccessSubscription.unsubscribe();
    }
  }

  public nestedManualJudgment(groups: IExecutionGroup[]) {
    if (SETTINGS.feature.manualJudgementEnabled) {
      const nestedObj: any = {};
      const crossApplicationChildExist: Array<{ parent: string; currentChild: string; child: string }> = [];
      groups.forEach(({ runningExecutions }) => {
        if (runningExecutions && runningExecutions.length) {
          const childPipeline = this.crossApplicationView(runningExecutions);
          if (childPipeline.length > 0) {
            crossApplicationChildExist.push(...childPipeline);
          }
          const executions = runningExecutions.filter(
            (exec) =>
              exec.trigger.parentExecution &&
              exec.stages.filter(
                (stage) => (stage.type == 'manualJudgment' || 'PIPELINE') && stage.status === 'RUNNING',
              ).length,
          );
          executions.forEach((execution) => {
            const stageType = execution.stages.filter((stage) => stage.type == 'manualJudgment').length
              ? 'id'
              : 'pipelineId';
            nestedObj[execution.trigger.parentExecution.id] = nestedObj[execution.trigger.parentExecution.id] ?? [];
            nestedObj[execution.trigger.parentExecution.id].push({
              name: execution.name,
              [stageType]: execution.id,
            });
          });
        }
      });
      return crossApplicationChildExist.length
        ? this.crossAppDataFetch(crossApplicationChildExist, nestedObj)
        : nestedObj;
    }
  }

  public crossApplicationView(execution: IExecution[]) {
    const childAcrossAppliocation: Array<{ parent: string; currentChild: string; child: string }> = [];
    execution.forEach((exec) =>
      exec.stages.forEach((stage) => {
        if (stage.context.application && stage.context.application !== exec.application) {
          childAcrossAppliocation.push({
            parent: exec.id,
            currentChild: stage.context.executionId,
            child: stage.context.executionId,
          });
        }
      }),
    );
    return childAcrossAppliocation;
  }

  crossAppDataFetch = (executions: Array<{ parent: string; currentChild: string; child: string }>, nestedObj: any) => {
    const manualJudgementDataObj = nestedObj;
    executions.forEach((exec) => {
      const executionContext = this.executionService.getCrossApplicationExecutionContext(exec.child);
      Observable.fromPromise(executionContext).subscribe((executionContext) => {
        const nestedpipeline: Array<{ parent: string; currentChild: string; child: string }> = [];
        if (executionContext.status === 'RUNNING') {
          executionContext.stages.forEach((stage) => {
            if (stage.type === 'manualJudgment' && stage.status === 'RUNNING') {
              manualJudgementDataObj[exec.parent] = manualJudgementDataObj[exec.parent] ?? [];
              const leafeNode =
                exec.child === exec.currentChild
                  ? { name: executionContext.name, id: exec.child, app: executionContext.application }
                  : {
                      name: executionContext.name,
                      id: exec.child,
                      currentChild: exec.currentChild,
                      app: executionContext.application,
                    };
              manualJudgementDataObj[exec.parent].push(leafeNode);
            }
            if (stage.context.executionId !== undefined) {
              nestedpipeline.push({
                parent: exec.parent,
                currentChild: exec.currentChild,
                child: stage.context.executionId,
              });
            }
          });
        }
        if (nestedpipeline.length > 0) {
          return this.crossAppDataFetch(nestedpipeline, manualJudgementDataObj);
        }
      });
    });
    return manualJudgementDataObj;
  };

  public render(): React.ReactElement<ExecutionGroups> {
    const { groups = [], container, showingDetails } = this.state;
    const hasGroups = groups.length > 0;
    const className = `row pipelines executions ${showingDetails ? 'showing-details' : ''}`;

    const allGroups = (groups || [])
      .filter((g: IExecutionGroup) => g?.config?.migrationStatus === 'Started')
      .concat(groups.filter((g) => g?.config?.migrationStatus !== 'Started'));

    const executionGroups = ExecutionFilterService.awaitingJudgment(allGroups).map((group: IExecutionGroup) => (
      <ExecutionGroup
        parent={container}
        key={group.heading}
        group={group}
        application={this.props.application}
        id={group.heading}
        manualJudgment={this.nestedManualJudgment(groups)}
      />
    ));

    return (
      <div className="execution-groups-section">
        <div className={className}>
          {!hasGroups && (
            <div className="text-center">
              <h4>No executions match the filters you've selected.</h4>
            </div>
          )}
          <div className="execution-groups all-execution-groups" ref={this.setContainer}>
            <BannerContainer app={this.props.application} />
            {container && executionGroups}
          </div>
        </div>
      </div>
    );
  }
}
