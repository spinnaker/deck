import React from 'react';

import { DataSourceNotifications } from '../../entityTag/notifications/DataSourceNotifications';
import { Icon, useDataSource, useObservable } from '../../presentation';

import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../../application';
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
  useObservable(status$, () => {
    setTags(alerts || []);
  });

  /**
   * This helps with rendering latency from setting initial tags
   */
  const tagList = (alerts || []).length && !tags.length ? alerts : tags;
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
      <DataSourceNotifications tags={tagList} application={app} tabName={label} />
    </div>
  );
};
