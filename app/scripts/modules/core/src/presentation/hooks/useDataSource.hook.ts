import { useObservableValue } from './useObservableValue.hook';
import { useLatestCallback } from './useLatestCallback.hook';

import { ApplicationDataSource, IFetchStatus } from '../../application';

export interface IDataSourceResult<T> {
  data: T;
  status: IFetchStatus;
  loaded: boolean;
  loading: boolean;
  loadFailure: boolean;
  refresh: () => void;
}

/**
 * A react hook that returns the current value an ApplicationDataSource
 * and triggers a re-render when a new value is set. Also provides a function
 * for refreshing the data source manually.
 *
 * @param dataSource the data source to subscribe to
 * @returns IDataSourceResult<T>
 */
export const useDataSource = <T>(dataSource: ApplicationDataSource<T>): IDataSourceResult<T> => {
  const data = useObservableValue(dataSource.data$, dataSource.data$.value);
  const status = useObservableValue(dataSource.status$, dataSource.status$.value);
  const { loaded, loading, loadFailure } = dataSource;

  // Memoize to give consumers a stable ref,
  // but don't return the promise that dataSource.refresh() returns
  const refresh = useLatestCallback(() => {
    dataSource.refresh();
  });

  return {
    data,
    status,
    loaded,
    loading,
    loadFailure,
    refresh,
  };
};
