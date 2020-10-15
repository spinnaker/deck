/* eslint-disable */
import React from 'react';
import { Subscription } from 'rxjs';

import { Application } from 'core/application/application.model';
import { ExecutionGroup } from './ExecutionGroup';
import { IExecutionGroup } from 'core/domain';
import { ReactInjector } from 'core/reactShims';
import { ExecutionState } from 'core/state';
import { ExecutionFilterService } from '../../filter/executionFilter.service';

import './executionGroups.less';

export interface IExecutionGroupsProps {
  application: Application;
}

export interface IExecutionGroupsState {
  groups: IExecutionGroup[];
  showingDetails: boolean;
  goToParent: (executionId: string, name: string) => void;
  container?: HTMLDivElement; // need to pass the container down to children to use as root for IntersectionObserver
}

export class ExecutionGroups extends React.Component<IExecutionGroupsProps, IExecutionGroupsState> {
  private applicationRefreshUnsubscribe: () => void;
  private groupsUpdatedSubscription: Subscription;
  private stateChangeSuccessSubscription: Subscription;
  private goToParent = (executionId: '', parent: '') => {
    if (executionId !== '') {
      var parentElement = document.getElementById('execution-groups-scroll');
      var destination = document.getElementById('execution-' + executionId);
      if (destination === null) {
        var destination = document.getElementById(parent);
        parentElement.scrollTo(0, destination.offsetTop - 140);
      } else parentElement.scrollTo(0, destination.offsetTop - destination.offsetHeight - 40);
    }
  };

  constructor(props: IExecutionGroupsProps) {
    super(props);
    const { stateEvents } = ReactInjector;
    this.state = {
      goToParent: this.goToParent,
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
  public filterGroups(groups: IExecutionGroup[]) {
    const filterStages = ExecutionState.filterModel.asFilterModel.sortFilter.filterStages;
    if (filterStages) {
      return groups.filter(
        (group) =>
          group.executions.filter((execution) => {
            if (execution.originalStatus == 'RUNNING') {
              return execution.stages.filter((stage) => stage.type === 'manualJudgment').length > 0;
            } else return true;
          }).length,
      );
    } else return groups;
  }
  public nestedManualJudgment(groups: IExecutionGroup[]) {
    const nestedObj: any = {};
    groups.forEach(({ runningExecutions }) => {
      if (runningExecutions && runningExecutions.length) {
        const executions = runningExecutions.filter(
          (exec) =>
            exec.trigger.parentExecution &&
            exec.stages.filter((stage) => stage.type == 'manualJudgment' && stage.status === 'RUNNING'),
        );
        executions.forEach((execution) => {
          nestedObj[execution.trigger.parentExecution.id] = nestedObj[execution.trigger.parentExecution.id] ?? [];
          nestedObj[execution.trigger.parentExecution.id].push({
            name: execution.name,
            id: execution.id,
          });
        });
      }
    });
    return nestedObj;
  }

  public render(): React.ReactElement<ExecutionGroups> {
    const { groups = [], container, showingDetails } = this.state;
    const hasGroups = groups.length > 0;
    const className = `row pipelines executions ${showingDetails ? 'showing-details' : ''}`;
    this.filterGroups(groups);
    const executionGroups = this.filterGroups(groups).map((group: IExecutionGroup) => (
      <ExecutionGroup
        parent={container}
        key={group.heading}
        id={group.heading}
        group={group}
        goToParent={this.state.goToParent}
        application={this.props.application}
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
          <div className="execution-groups all-execution-groups" ref={this.setContainer} id="execution-groups-scroll">
            {container && executionGroups}
          </div>
        </div>
      </div>
    );
  }
}
