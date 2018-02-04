import * as React from 'react';

import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry, DefaultSearchResultTab, ISearchResult,
  HeaderCell, TableBody, TableHeader, TableRow, ISearchColumn, SearchResultType, ISearchResultSet,
} from 'core/search';

export interface IInstanceSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  displayName: string;
  href: string;
  instanceId: string;
  provider: string;
  region: string;
  serverGroup: string;
  type: string;
}

class InstancesSearchResultType extends SearchResultType<IInstanceSearchResult> {
  public id = 'instances';
  public order = 4;
  public displayName = 'Instances';
  public iconClass = 'fa fa-hdd-o';

  private cols: { [key: string]: ISearchColumn } = {
    INSTANCE: { key: 'instanceId', label: 'Instance ID' },
    ACCOUNT: { key: 'account' },
    REGION: { key: 'region' },
    SERVERGROUP: { key: 'serverGroup' }
  };

  public TabComponent = DefaultSearchResultTab;

  public HeaderComponent = () => (
    <TableHeader>
      <HeaderCell col={this.cols.INSTANCE}/>
      <HeaderCell col={this.cols.ACCOUNT}/>
      <HeaderCell col={this.cols.REGION}/>
      <HeaderCell col={this.cols.SERVERGROUP}/>
    </TableHeader>
  );

  public DataComponent = ({ resultSet }: { resultSet: ISearchResultSet<IInstanceSearchResult> }) => {
    const itemKeyFn = (item: IInstanceSearchResult) => item.instanceId;
    const itemSortFn = (a: IInstanceSearchResult, b: IInstanceSearchResult) =>
      a.instanceId.localeCompare(b.instanceId);

    const results = resultSet.results.slice().sort(itemSortFn);

    return (
      <TableBody>
        {results.slice().sort(itemSortFn).map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={this.cols.INSTANCE} />
            <AccountCell item={item} col={this.cols.ACCOUNT} />
            <BasicCell item={item} col={this.cols.REGION} />
            <BasicCell item={item} col={this.cols.SERVERGROUP} defaultValue="Standalone Instance" />
          </TableRow>
        ))}
      </TableBody>
    );
  };

  public displayFormatter(searchResult: IInstanceSearchResult) {
    const serverGroup = searchResult.serverGroup || 'standalone instance';
    return `${searchResult.instanceId} (${serverGroup} - ${searchResult.region})`;
  }
}

searchResultTypeRegistry.register(new InstancesSearchResultType());
