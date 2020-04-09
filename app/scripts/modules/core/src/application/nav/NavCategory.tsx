import React from 'react';

import { DataSourceNotifications } from '../../entityTag/notifications/DataSourceNotifications';
import { Icon } from '../../presentation';

import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../../application';
import { IEntityTags } from '../../domain';

export interface INavCategoryProps {
  category: ApplicationDataSource;
  isActive: boolean;
  app: Application;
}

export const NavCategory: React.FC<INavCategoryProps> = ({ app, category, isActive }: INavCategoryProps) => {
  const { alerts, badge, iconName, label } = category;
  const badgeSourceData = badge ? app.getDataSource(badge).data.length : 0;

  const [runningCount, setRunningCount] = React.useState<number>(badgeSourceData);
  const [tags, setTags] = React.useState<IEntityTags[]>(alerts || []);

  const runningCountSubscription = badge ? category.refresh$.subscribe(() => setRunningCount(badgeSourceData)) : null;
  const tagsSubscription = category.refresh$.subscribe(() => setTags(alerts || []));
  const [runningCountSub, setRunningCountSub] = React.useState(runningCountSubscription);
  const [tagsSub, setTagsSub] = React.useState(tagsSubscription);

  const configureSubscriptions = () => {
    setRunningCountSub(runningCountSubscription);
    setTagsSub(tagsSub);
  };

  const clearSubscriptions = () => {
    runningCountSub && runningCountSub.unsubscribe();
    tagsSub.unsubscribe();
  };

  React.useEffect(() => {
    setRunningCount(badgeSourceData);
    setTags(alerts || []);
    clearSubscriptions();
    configureSubscriptions();
    return clearSubscriptions;
  }, [alerts, badgeSourceData]);

  /**
   *  The subscriptions coupled with useState cause some latency when setting   the initial state.
   *  These checks help reduce the initial rendering time for tags and run counts
   */

  const showCount = (badgeSourceData && !runningCount) || runningCount;
  const count = badgeSourceData && !runningCount ? badgeSourceData : runningCount;
  const badgeClassNames = showCount ? 'badge-running-count' : 'badge-none';
  const tagList = (alerts || []).length && !tags.length ? alerts : tags;

  return (
    <div className="nav-category">
      <div className={badgeClassNames}>{showCount ? count : ''}</div>
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
