import React from 'react';
import { $window } from 'ngimport';

import { ApplicationFreshIcon } from '../ApplicationFreshIcon';
import { SchedulerFactory } from 'core/scheduler';
import { Icon, Tooltip } from 'core/presentation';
import { relativeTime, timestamp } from 'core/utils/timeFormatters';

export interface IAppRefreshIconProps {
  lastRefresh: number;
  refresh: () => void;
  refreshing: boolean;
}

export const AppRefresherIcon = ({ lastRefresh, refresh, refreshing }: IAppRefreshIconProps) => {
  const activeRefresher = SchedulerFactory.createScheduler(2000);
  const [timeSinceRefresh, setTimeSinceRefresh] = React.useState(relativeTime(lastRefresh));
  const [iconPulsing, setIconPulsing] = React.useState(false);

  React.useEffect(() => {
    activeRefresher.subscribe(() => {
      setTimeSinceRefresh(relativeTime(lastRefresh));
    });

    return () => activeRefresher.unsubscribe();
  }, [lastRefresh]);

  const oldAge = 2 * 60 * 1000; // 2 minutes;
  const age = new Date().getTime() - lastRefresh;
  const isStale = age > oldAge;

  const refreshApp = () => {
    setIconPulsing(true);
    setTimeout(() => {
      setIconPulsing(false);
    }, 3000);
    refresh();
  };

  const RefresherTooltip = (
    <span>
      {refreshing && (
        <p>
          Application is <strong>refreshing</strong>.
        </p>
      )}
      {!refreshing && (
        <p>
          (click <span className="fa fa-sync-alt" /> to refresh)
        </p>
      )}
      <p>
        Last refresh: {timestamp(lastRefresh)} <br /> ({timeSinceRefresh})
      </p>
      <p className="small">
        <strong>Note:</strong> Due to caching, data may be delayed up to 2 minutes
      </p>
    </span>
  );

  return (
    <Tooltip template={RefresherTooltip} placement={$window.innerWidth < 1100 ? 'bottom' : 'right'}>
      <div className={`application-header-icon${iconPulsing ? ' header-icon-pulsing' : ''}`} onClick={refreshApp}>
        {!isStale && !iconPulsing && <ApplicationFreshIcon />}
        {(isStale || iconPulsing) && <Icon name="spMenuAppUnsynced" size="small" appearance="light" />}
      </div>
    </Tooltip>
  );
};
