import React from 'react';
import { Observable, Subject } from 'rxjs';

import { Application } from '../application.model';
import { ApplicationDataSource, IFetchStatus } from '../service/applicationDataSource';

import { AppRefresherIcon } from './AppRefresherIcon';

export interface IAppRefresherProps {
  app: Application;
}

export const AppRefresher = ({ app }: IAppRefresherProps) => {
  const app$ = new Subject<Application>();
  const destroy$ = new Subject();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState(0);

  const updateStatus = (fetchStatus: IFetchStatus): void => {
    if (fetchStatus.status === 'FETCHING') {
      setIsRefreshing(true);
    } else if (fetchStatus.status === 'FETCHED') {
      setIsRefreshing(false);
      setLastRefresh(fetchStatus.lastRefresh);
    } else {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    app.refresh(true);
  };

  React.useEffect(() => {
    app$
      .filter(app => !!app)
      .distinctUntilChanged()
      // follow the data source from the active tab
      .switchMap(app => app.activeDataSource$)
      .startWith(null)
      .mergeMap((dataSource: ApplicationDataSource) => {
        // If there is no active data source (e.g., on config tab), use the application's status.
        const fetchStatus$: Observable<IFetchStatus> = (dataSource && dataSource.status$) || app.status$;
        return fetchStatus$.filter(fetchStatus => ['FETCHING', 'FETCHED', 'ERROR'].includes(fetchStatus.status));
      })
      .takeUntil(destroy$)
      .subscribe(fetchStatus => updateStatus(fetchStatus));

    app$.next(app);

    return () => destroy$.next();
  }, []);

  React.useEffect(() => {
    app$.next(app);
  }, [app]);

  return <AppRefresherIcon lastRefresh={lastRefresh} refreshing={isRefreshing} refresh={handleRefresh} />;
};
