import * as React from 'react';

import { CollapsibleSection, NgReact, Overridable, Application } from '@spinnaker/core';

import { ITencentServerGroupDetailsSectionProps } from './ITencentServerGroupDetailsSectionProps';
import { TencentResizeServerGroupModal } from '../resize/TencentResizeServerGroupModal';
import { ITencentServerGroup } from 'tencent/domain';

@Overridable('tencent.serverGroup.CapacityDetailsSection')
export class CapacityDetailsSection extends React.Component<ITencentServerGroupDetailsSectionProps> {
  public static resizeServerGroup(serverGroup: ITencentServerGroup, application: Application): void {
    TencentResizeServerGroupModal.show({ application, serverGroup });
  }

  public render(): JSX.Element {
    const { serverGroup, app } = this.props;
    const { ViewScalingActivitiesLink } = NgReact;
    const simple = serverGroup.asg.minSize === serverGroup.asg.maxSize;

    return (
      <CollapsibleSection heading="Capacity" defaultExpanded={true}>
        <dl className="dl-horizontal dl-flex">
          {simple && <dt>Min/Max</dt>}
          {simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}

          {!simple && <dt>Min</dt>}
          {!simple && <dd>{serverGroup.asg.minSize}</dd>}
          {!simple && <dt>Desired</dt>}
          {!simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}
          {!simple && <dt>Max</dt>}
          {!simple && <dd>{serverGroup.asg.maxSize}</dd>}

          <dt>Current</dt>
          <dd>{serverGroup.asg.instanceCount}</dd>
        </dl>

        <div>
          <a className="clickable" onClick={() => CapacityDetailsSection.resizeServerGroup(serverGroup, app)}>
            Resize Server Group
          </a>
        </div>

        <div>
          <ViewScalingActivitiesLink serverGroup={serverGroup} />
        </div>
      </CollapsibleSection>
    );
  }
}
