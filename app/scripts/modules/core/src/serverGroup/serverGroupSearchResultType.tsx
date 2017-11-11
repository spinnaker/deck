import * as React from 'react';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import {
  AccountCell, BasicCell, HrefCell, HealthCountsCell, searchResultTypeRegistry, ISearchColumn, ISearchResultType,
  SearchResultTabComponent, SearchResultsHeaderComponent, SearchResultsDataComponent, DefaultSearchResultTab,
  ISearchResult, HeaderCell, TableBody, TableHeader, TableRow,
} from 'core/search';

import { ReactInjector } from 'core/reactShims';
import { IServerGroup, IInstanceCounts } from 'core/domain';

import './serverGroup.less';

export interface IServerGroupSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  detail: string;
  email?: string;
  region: string;
  sequence: string;
  serverGroup: string;
  stack: string;
  url: string;
  instanceCounts: IInstanceCounts;
}

const cols: { [key: string]: ISearchColumn } = {
  SERVERGROUP: { key: 'serverGroup', label: 'Name' },
  ACCOUNT: { key: 'account' },
  REGION: { key: 'region' },
  EMAIL: { key: 'email' },
  HEALTH: { key: 'instanceCounts', label: 'Health' },
};

const iconClass = 'fa fa-th-large';
const displayName = 'Server Groups';

const itemKeyFn = (item: IServerGroupSearchResult) =>
  [item.serverGroup, item.account, item.region].join('|');
const itemSortFn = (a: IServerGroupSearchResult, b: IServerGroupSearchResult) => {
  const order = a.serverGroup.localeCompare(b.serverGroup);
  return order !== 0 ? order : a.region.localeCompare(b.region);
};

const SearchResultTab: SearchResultTabComponent = ({ ...props }) => (
  <DefaultSearchResultTab {...props} iconClass={iconClass} label={displayName} />
);

const SearchResultsHeader: SearchResultsHeaderComponent = () => (
  <TableHeader>
    <HeaderCell col={cols.SERVERGROUP}/>
    <HeaderCell col={cols.ACCOUNT}/>
    <HeaderCell col={cols.REGION}/>
    <HeaderCell col={cols.EMAIL}/>
    <HeaderCell col={cols.HEALTH}/>
  </TableHeader>
);

const SearchResultsData: SearchResultsDataComponent<IServerGroupSearchResult> = ({ results }) => (
  <TableBody>
    {results.slice().sort(itemSortFn).map(item => (
      <TableRow key={itemKeyFn(item)}>
        <HrefCell item={item} col={cols.SERVERGROUP} />
        <AccountCell item={item} col={cols.ACCOUNT} />
        <BasicCell item={item} col={cols.REGION} />
        <BasicCell item={item} col={cols.EMAIL} />
        <HealthCountsCell item={item} col={cols.HEALTH} />
      </TableRow>
    ))}
  </TableBody>
);

interface IServerGroupDataProps {
  type: ISearchResultType;
  results: IServerGroupSearchResult[],
}

interface IServerGroupDataState {
  serverGroups: IServerGroupSearchResult[],
}

interface IServerGroupTuple {
  toFetch: IServerGroupSearchResult;
  fetched: IServerGroup;
}

const makeServerGroupTuples = (sgToFetch: IServerGroupSearchResult[], fetched: IServerGroup[]): IServerGroupTuple[] => {
  const findFetchedValue = (toFetch: IServerGroupSearchResult) => fetched.find(sg => sg.name === toFetch.serverGroup);
  return sgToFetch.map(toFetch => ({ toFetch, fetched: findFetchedValue(toFetch) }));
};

const fetchServerGroups = (toFetch: IServerGroupSearchResult[]) => {
  const fetchPromise = ReactInjector.API.one('serverGroups')
    .withParams({ serverGroupNames: toFetch.map(sg => `${sg.account}:${sg.region}:${sg.serverGroup}`) })
    .get()
    .then((fetched: IServerGroup[]) => makeServerGroupTuples(toFetch, fetched));

  return Observable.fromPromise(fetchPromise);
};

/**
 * Wraps a server group search results component and augments with health/instance counts
 *
 * The /search endpoints do not return instance counts.
 * This component waits until it is rendered, then starts fetching instance counts and mutating the search results.
 */
const AddHealthCounts = (Component: SearchResultsDataComponent<IServerGroupSearchResult>): SearchResultsDataComponent<IServerGroupSearchResult> => {
  return class FetchHealthCounts extends React.Component<IServerGroupDataProps, IServerGroupDataState> {
    public state = { serverGroups: [] } as any;
    private results$ = new BehaviorSubject<IServerGroupSearchResult[]>([]);
    private stop$ = new Subject();

    constructor(props: any) {
      super(props);

      const failedFetch = (failedFetches: IServerGroupSearchResult[]) =>
        Observable.of(failedFetches.map(toFetch => ({ toFetch, fetched: { instanceCounts: null } })));

      // fetch a batch of server groups.
      const processBatch = (batch: IServerGroupSearchResult[]) => {
        return fetchServerGroups(batch).catch((err: { status: number }) => {
          // In case of 404 during batch fetch, fall back to individual fetch
          if (err.status === 404) {
            // retry, but fetch each servergroup individually
            return Observable.from(batch).flatMap(sg => {
              return fetchServerGroups([sg]).catch(() => failedFetch([sg]))
            });
          }

          return Observable.of(failedFetch(batch))
        });
      };

      this.results$.flatMap((searchResults: IServerGroupSearchResult[]) => {
        return Observable.from(searchResults)
          .filter(result => result.instanceCounts === undefined)
          // Serially fetch instance counts in batches of 25
          .bufferCount(25)
          .concatMap(processBatch);
      })
      .takeUntil(this.stop$)
      .subscribe((tuples: IServerGroupTuple[]) => {
        tuples.forEach(result => result.toFetch.instanceCounts = result.fetched.instanceCounts);
        this.setState({ serverGroups: this.results$.value.slice() });
      });
    }

    private applyServerGroups(serverGroups: IServerGroupSearchResult[]) {
      serverGroups = serverGroups.sort(itemSortFn);
      this.results$.next(serverGroups);
      this.setState({ serverGroups })
    }

    public componentDidMount() {
      this.applyServerGroups(this.props.results);
    }

    public componentWillReceiveProps(nextProps: IServerGroupDataProps) {
      this.applyServerGroups(nextProps.results);
    }

    public componentWillUnmount() {
      this.stop$.next();
      this.stop$.complete();
    }

    public render() {
      return <Component type={this.props.type} results={this.state.serverGroups} />
    }
  }
};

const serverGroupSearchResultType: ISearchResultType = {
  id: 'serverGroups',
  order: 6,
  iconClass,
  displayName,
  displayFormatter: (searchResult: IServerGroupSearchResult) => `${searchResult.serverGroup} (${searchResult.region})`,
  components: {
    SearchResultTab,
    SearchResultsHeader,
    SearchResultsData: AddHealthCounts(SearchResultsData),
  },
};

searchResultTypeRegistry.register(serverGroupSearchResultType);
