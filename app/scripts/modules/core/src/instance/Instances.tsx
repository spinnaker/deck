import * as React from 'react';
import { Transition } from '@uirouter/core';
import { BindAll } from 'lodash-decorators';
import { Subscription } from 'rxjs';

import { IInstance } from 'core/domain';
import { Instance } from './Instance';

export interface IInstancesProps {
  instances: IInstance[];
  highlight?: string;
}

export interface IInstancesState {
  detailsInstanceId: string;
}

@BindAll()
export class Instances extends React.Component<IInstancesProps, IInstancesState> {
  // context from enclosing UIView
  public static contextTypes = {
    router: React.PropTypes.object,
    parentUIViewAddress: React.PropTypes.object,
  };

  private subscription: Subscription;

  constructor(props: IInstancesProps) {
    super(props);
    this.state = {
      detailsInstanceId: null,
    };
  }

  public componentDidMount() {
    this.subscription = this.context.router.globals.success$.subscribe(this.onStateChange);
  }

  public componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  private onStateChange(transition: Transition) {
    const isShowingDetails = !!/\.instanceDetails/.exec(transition.to().name);
    const detailsInstanceId = isShowingDetails ? transition.params().instanceId : null;
    this.setState({ detailsInstanceId });
  }

  public shouldComponentUpdate(nextProps: IInstancesProps, nextState: IInstancesState) {
    const propsKeys: [keyof IInstancesProps] = ['instances', 'highlight'];
    if (propsKeys.some(key => this.props[key] !== nextProps[key])) {
      return true;
    }

    if (this.state.detailsInstanceId !== nextState.detailsInstanceId) {
      const ids = nextProps.instances.map(x => x.id);
      if (ids.includes(this.state.detailsInstanceId) || ids.includes(nextState.detailsInstanceId)) {
        return true;
      }
    }

    return false;
  }

  private handleInstanceClicked(instance: IInstance) {
    const { router, parentUIViewAddress } = this.context;
    const params = { instanceId: instance.id, provider: instance.provider };
    const options = { relative: parentUIViewAddress.context };

    router.stateService.go('.instanceDetails', params, options);
  }

  private partitionInstances(): IInstance[][] {
    const partitions: IInstance[][] = [];
    const instances = (this.props.instances || []).sort((a, b) => a.launchTime - b.launchTime);
    if (!instances.length) {
      return partitions;
    }
    let currentPartition: IInstance[] = [];
    let currentState = instances[0].healthState;
    instances.forEach(i => {
      if (i.healthState !== currentState) {
        partitions.push(currentPartition);
        currentPartition = [];
      }
      currentPartition.push(i);
      currentState = i.healthState;
    });
    partitions.push(currentPartition);
    return partitions;
  }

  public render() {
    const partitions = this.partitionInstances();
    return (
      <div className="instances">
        {partitions.map((p, i) => (
          <span key={i} className={`instance-group instance-group-${p[0].healthState}`}>
            {p.map(instance => (
              <Instance
                key={instance.id}
                instance={instance}
                active={this.state.detailsInstanceId === instance.id}
                highlight={this.props.highlight}
                onInstanceClicked={this.handleInstanceClicked}
              />
            ))}
          </span>
        ))}
      </div>
    )
  }
}
