import React from 'react';
import classNames from 'classnames';
import ReactGA from 'react-ga';
import { sortBy } from 'lodash';

import { Application } from 'core/application';
import { AutoscalerButton } from './AutoscalerButton';
import { AutoscalerListItem } from './AutoscalerListItem';
import { IAutoscaler, IServerGroup } from 'core/domain';
import { BadgePopover } from 'core/presentation';
import { ReactInjector } from 'core/reactShims';

export interface IAutoscalerProps {
  application: Application;
  serverGroup: IServerGroup;
}

export class Autoscalers extends React.Component<IAutoscalerProps> {
  private showAutoscalerDetails = (name: string): void => {
    const { $state } = ReactInjector;
    const { account: accountId, region, type: provider } = this.props.serverGroup;

    ReactGA.event({ category: 'Cluster Pod', action: `Load Autoscaler Details (multiple menu)` });

    const nextState = $state.current.name.endsWith('.clusters') ? '.autoscalerDetails' : '^.autoscalerDetails';
    $state.go(nextState, {
      accountId,
      name,
      provider,
      region,
    });
  };

  public handleShowPopover = () => {
    ReactGA.event({ category: 'Cluster Pod', action: `Show Autoscalers Menu` });
  };

  public handleClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  public render(): React.ReactElement<Autoscalers> {
    const { application, serverGroup } = this.props;
    if (!application || !serverGroup.autoscalers) return null;

    const applicationAutoscalers = application.getDataSource('autoscalers').data;

    const autoscalers = serverGroup.autoscalers.filter((sgAutoScalerName: string) =>
      applicationAutoscalers.find(
        ({ account, name, region }: IAutoscaler) =>
          name === sgAutoScalerName &&
          account === serverGroup.account &&
          (region === serverGroup.region || region === 'global'),
      ),
    );

    const autoscalerCount = autoscalers.length;

    const className = classNames({
      'autoscalers-tag': true,
      overflowing: autoscalerCount > 1,
    });

    const autoscalerList = sortBy(autoscalers, 'name').map(autoscaler => (
      <AutoscalerListItem key={autoscaler} autoscaler={autoscaler} onItemClick={this.showAutoscalerDetails} />
    ));

    return (
      <span className={className}>
        {autoscalerCount > 1 && (
          <BadgePopover
            count={autoscalerCount}
            handleBadgeClick={this.handleClick}
            handleShowPopover={this.handleShowPopover}
            icon={<i className="fa icon-balance-scale" />}
            popoverBody={autoscalerList}
            title="Autoscalers"
          />
        )}

        {autoscalerCount === 1 && (
          <span className="btn-autoscaler">
            {sortBy(autoscalers, 'name').map(autoscalerName => (
              <AutoscalerButton key={autoscalerName} name={autoscalerName} onItemClick={this.showAutoscalerDetails} />
            ))}
          </span>
        )}
      </span>
    );
  }
}
