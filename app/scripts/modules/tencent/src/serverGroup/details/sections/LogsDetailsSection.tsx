import * as React from 'react';

import { CollapsibleSection, NgReact } from '@spinnaker/core';

import { ITencentServerGroupDetailsSectionProps } from './ITencentServerGroupDetailsSectionProps';

export class LogsDetailsSection extends React.Component<ITencentServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { ViewScalingActivitiesLink } = NgReact;
    return (
      <CollapsibleSection heading="Logs">
        <ul>
          <li>
            <ViewScalingActivitiesLink serverGroup={this.props.serverGroup} />
          </li>
        </ul>
      </CollapsibleSection>
    );
  }
}
