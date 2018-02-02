import * as React from 'react';
import * as ReactGA from 'react-ga';
import { Dropdown } from 'react-bootstrap';

import { IServerGroup } from 'core/domain';

export class ServerGroupInsightActions extends React.Component<{ serverGroup: IServerGroup }> {
  private onClick(label: string): void {
    const { serverGroup } = this.props;
    ReactGA.event({
      category: 'Insight Menu (Server Group)',
      action: `${label} clicked`,
      label: `${serverGroup.account}/${serverGroup.region}/${serverGroup.name}`,
      });
  }

  public render(): JSX.Element {
    const { serverGroup } = this.props;

    const hasInsightActions = serverGroup && serverGroup.insightActions && serverGroup.insightActions.length > 0;

    if (hasInsightActions) {
      return (
        <Dropdown className="dropdown" id="server-group-insight-dropdown" pullRight={true}>
          <Dropdown.Toggle className="btn btn-sm btn-default dropdown-toggle">
            Insight
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            {serverGroup.insightActions.map((action) => <li key={action.label}><a target="_blank" onClick={() => this.onClick(action.label)} href={action.url}>{action.label}</a></li>)}
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return null;
  }
}
