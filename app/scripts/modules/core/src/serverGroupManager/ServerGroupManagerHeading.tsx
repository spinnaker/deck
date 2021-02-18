import { Application } from 'core/application';
import { CloudProviderLogo } from 'core/cloudProvider';
import { IClusterSubgroup } from 'core/cluster';
import { SETTINGS } from 'core/config';
import { IInstanceCounts } from 'core/domain';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';
import { HealthCounts } from 'core/healthCounts';
import React from 'react';

export interface IServerGroupManagerHeadingProps {
  health: IInstanceCounts;
  provider: string;
  heading: string;
  grouping: IClusterSubgroup;
  app: Application;
  onClick(event: React.MouseEvent<HTMLElement>): void;
}

export const ServerGroupManagerHeading = ({
  onClick,
  health,
  provider,
  heading,
  grouping,
  app,
}: IServerGroupManagerHeadingProps) => {
  const showEntityTags = SETTINGS.feature && SETTINGS.feature.entityTags;

  return (
    <div className={`flex-container-h baseline server-group-title`} onClick={onClick}>
      <div className="flex-container-h baseline section-title">
        <CloudProviderLogo provider={provider} height="16px" width="16px" />
        {heading}
      </div>
      {showEntityTags && (
        <EntityNotifications
          entity={grouping}
          application={app}
          placement="bottom"
          hOffsetPercent="90%"
          entityType="serverGroupManager"
          pageLocation="details"
          onUpdate={() => app.serverGroupManagers.refresh()}
        />
      )}
      <div className="flex-container-h baseline flex-pull-right">
        <HealthCounts container={health} />
      </div>
    </div>
  );
};
