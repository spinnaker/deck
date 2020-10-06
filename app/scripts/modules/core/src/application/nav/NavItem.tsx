import React from 'react';
import { useRecoilValue } from 'recoil';

import { DataSourceNotifications } from 'core/entityTag/notifications/DataSourceNotifications';
import { Icon, Tooltip, useDataSource } from '../../presentation';
import { verticalNavExpandedAtom } from './navAtoms';

import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../application.model';
import { IEntityTags } from '../../domain';

export interface INavItemProps {
  app: Application;
  dataSource: ApplicationDataSource;
  isActive: boolean;
}

export const NavItem = ({ app, dataSource, isActive }: INavItemProps) => {
  const isExpanded = useRecoilValue(verticalNavExpandedAtom);
  const { alerts, badge, iconName, key, label } = dataSource;

  const { data: badgeData } = useDataSource(app.getDataSource(badge || key));
  const runningCount = badge ? badgeData.length : 0;

  // useDataSource is enough to update alerts when needed
  useDataSource(dataSource);
  const tags: IEntityTags[] = alerts || [];

  const badgeClassNames = runningCount ? 'badge-running-count' : 'badge-none';

  return (
    <>
      <span className={badgeClassNames}>{runningCount > 0 ? runningCount : ''}</span>
      <span className="nav-row-item">
        {iconName &&
          (!isExpanded ? (
            <Tooltip value={dataSource.label} placement="right">
              <span>
                <Icon className="nav-icon" name={iconName} size="medium" color={isActive ? 'primary' : 'accent'} />
              </span>
            </Tooltip>
          ) : (
            <Icon
              className="nav-icon"
              name={iconName || 'config'}
              size="medium"
              color={isActive ? 'primary' : 'accent'}
            />
          ))}
      </span>
      <span className="nav-row-item nav-name">{' ' + dataSource.label}</span>
      <DataSourceNotifications tags={tags} application={app} tabName={label} />
    </>
  );
};
