import React from 'react';
import classNames from 'classnames';

import { AccountTag } from 'core/account';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';
import { HealthCounts } from 'core/healthCounts';
import { ManagedResourceStatusIndicator } from 'core/managed';

import { IClusterPodTitleProps } from './ClusterPodTitleWrapper';

export class DefaultClusterPodTitle extends React.Component<IClusterPodTitleProps> {
  public render(): React.ReactElement<DefaultClusterPodTitle> {
    const { grouping, application, parentHeading } = this.props;

    return (
      <div className="rollup-title-cell">
        <div className="heading-tag">
          <AccountTag account={parentHeading} />
        </div>

        <div
          className={classNames('pod-center horizontal space-between flex-1', {
            'no-right-padding': grouping.isManaged,
          })}
        >
          <div>
            <span className="glyphicon glyphicon-th" />
            {' ' + grouping.heading}
          </div>

          <div className="flex-container-h margin-between-md">
            <EntityNotifications
              entity={grouping}
              application={application}
              placement="top"
              hOffsetPercent="90%"
              entityType="cluster"
              pageLocation="pod"
              className="inverse"
              onUpdate={() => application.serverGroups.refresh()}
            />

            {grouping.isManaged && (
              <ManagedResourceStatusIndicator shape="square" resourceSummary={grouping.managedResourceSummary} />
            )}
          </div>
        </div>

        <HealthCounts container={grouping.cluster.instanceCounts} />
      </div>
    );
  }
}
