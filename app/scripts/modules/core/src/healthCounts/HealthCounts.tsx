import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { isEqual } from 'lodash';

import { IInstanceCounts } from 'core/domain';
import { Placement, Tooltip } from 'core/presentation';

import './healthCounts.less';

export interface IHealthCountsProps {
  container: IInstanceCounts;
  additionalLegendText?: string;
  legendPlacement?: Placement;
};

export interface IHealthCountsState {
  percentLabel: string;
  statusClass: string;
  total: number;
};

@autoBindMethods
export class HealthCounts extends React.Component<IHealthCountsProps, IHealthCountsState> {
  public static defaultProps: Partial<IHealthCountsProps> = {
    legendPlacement: 'top',
    container: {} as IInstanceCounts
  };

  constructor(props: IHealthCountsProps) {
    super(props);
    this.state = this.calculatePercent(props.container);
  }

  private calculatePercent(container: IInstanceCounts): IHealthCountsState {
    container = container || {} as IInstanceCounts;

    const up = container.up || 0,
          down = container.down || 0,
          succeeded = container.succeeded || 0,
          failed = container.failed || 0,
          unknown = container.unknown || 0,
          starting = container.starting || 0,
          total = container.total || up + down + unknown + starting + succeeded + failed,
          percent = total ? Math.floor((up + succeeded) * 100 / total) : undefined,
          percentLabel = percent === undefined ? 'n/a' : percent + '%';

    const statusClass = percent === undefined ? 'disabled'
      : percent === 100 ? 'healthy'
      : percent < 100 && percent > 0 ? 'unhealthy'
      : percent === 0 ? 'dead' : 'disabled';

    return { percentLabel, statusClass, total };
  }

  public componentWillReceiveProps(nextProps: IHealthCountsProps): void {
    if (!isEqual(nextProps.container, this.props.container)) {
      this.setState(this.calculatePercent(nextProps.container));
    }
  }

  public render(): React.ReactElement<HealthCounts> {
    const legend = (
      <span>
        <table className="tooltip-table">
          <tbody>
            <tr>
              <td><span className="glyphicon glyphicon-Up-triangle healthy"/></td>
              <td>Up</td>
            </tr>
            <tr>
              <td><span className="glyphicon glyphicon-Down-triangle dead"/></td>
              <td>Down</td>
            </tr>
            <tr>
              <td><span className="glyphicon glyphicon-Unknown-triangle unknown"/></td>
              <td>In transition or no status reported</td>
            </tr>
            <tr>
              <td><span className="glyphicon glyphicon-minus disabled small"/></td>
              <td>Out of Service</td>
            </tr>
            <tr>
              <td><span className="glyphicon glyphicon-Succeeded-triangle small"/></td>
              <td>Terminated successfully</td>
            </tr>
            <tr>
              <td><span className="glyphicon glyphicon-Failed-triangle small"/></td>
              <td>Terminated unsuccessfully</td>
            </tr>
          </tbody>
        </table>
        <span>{this.props.additionalLegendText}</span>
      </span>
    );

    const container = this.props.container;
    const percentLabel = this.state.percentLabel;

    let hasValue = false;
    const counts: React.ReactElement<HTMLElement>[] = [];
    if (container.up) {
      counts.push(<span key="up"> {container.up} <span className="glyphicon glyphicon-Up-triangle healthy"/></span>);
      hasValue = true;
    }
    if (container.down && container.down !== container.missingHealthCount) {
      if (hasValue) { counts.push(<span key="downslash"> / </span>); }
      counts.push(<span key="down"> {container.down} <span className="glyphicon glyphicon-Down-triangle dead"/></span>);
      hasValue = true;
    }
    if (container.unknown || container.starting) {
      if (hasValue) { counts.push(<span key="unknownslash"> / </span>); }
      counts.push(<span key="unknown"> {container.unknown + container.starting} <span className="glyphicon glyphicon-Unknown-triangle unknown"/></span>);
      hasValue = true;
    }
    if (container.outOfService) {
      if (hasValue) { counts.push(<span key="outOfServiceslash"> / </span>); }
      counts.push(<span key="outOfService"> {container.outOfService} <span className="glyphicon glyphicon-OutOfService-triangle disabled small"/></span>);
      hasValue = true;
    }
    if (container.succeeded) {
      if (hasValue) { counts.push(<span key="succeededslash"> / </span>); }
      counts.push(<span key="succeeded"> {container.succeeded} <span className="glyphicon glyphicon-Succeeded-triangle disabled small"/></span>);
      hasValue = true;
    }
    if (container.failed) {
      if (hasValue) { counts.push(<span key="failedslash"> / </span>); }
      counts.push(<span key="failed"> {container.failed} <span className="glyphicon glyphicon-Failed-triangle disabled small"/></span>);
    }

    if (percentLabel !== 'n/a') {
      return (
        <div className="health-counts">
          <Tooltip template={legend} placement={this.props.legendPlacement}>
            <span className="counter instance-health-counts">
              {counts}
              {container.unknown !== this.state.total && (<span> : <span className={this.state.statusClass}>{percentLabel}</span></span>)}
            </span>
          </Tooltip>
        </div>
      );
    } else if (container.outOfService) {
      return (
        <div className="health-counts">
          <Tooltip template={legend}>
            <span className="counter instance-health-counts">
              <span>
                {container.outOfService} <span className="glyphicon glyphicon-minus disabled small"/>
              </span>
            </span>
          </Tooltip>
        </div>
      );
    } else {
      return null;
    }
  }
}
