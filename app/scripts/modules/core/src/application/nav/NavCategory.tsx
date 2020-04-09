import React from 'react';

import { DataSourceNotifications } from '../../entityTag/notifications/DataSourceNotifications';
import { Icon, useDataSource, useObservable } from '../../presentation';

import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application, IFetchStatus } from '../../application';
import { IEntityTags } from '../../domain';

export interface INavCategoryProps {
  category: ApplicationDataSource;
  isActive: boolean;
  app: Application;
}

export const NavCategory: React.FC<INavCategoryProps> = ({ app, category, isActive }: INavCategoryProps) => {
  const { alerts, badge, iconName, key, label, status$ } = category;
  const { data: badgeData } = useDataSource(app.getDataSource(badge || key));
  const runningCount = badge ? badgeData.length : 0;

  const [tags, setTags] = React.useState<IEntityTags[]>(alerts || []);
  useObservable(status$, (status: IFetchStatus) => {
    const newTags = status.data.map((d: ApplicationDataSource) => d.entityTags).filter((d: ApplicationDataSource) => d);
    setTags(newTags);
  });
  const badgeClassNames = runningCount ? 'badge-running-count' : 'badge-none';

  return (
    <div className="nav-category">
      <div className={badgeClassNames}>{runningCount > 0 ? runningCount : ''}</div>
      <div className="nav-item">
        {iconName && (
          <Icon className="nav-icon" name={iconName} size="extraSmall" color={isActive ? 'primary' : 'accent'} />
        )}
      </div>
      <div className="nav-item">{' ' + category.label}</div>
      <DataSourceNotifications tags={tags} application={app} tabName={label} />
    </div>
  );
};
