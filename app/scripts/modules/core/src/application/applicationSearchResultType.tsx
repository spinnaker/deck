import * as React from 'react';

import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry, ISearchResult, DefaultSearchResultTab,
  HeaderCell, TableBody, TableHeader, TableRow, ISearchColumn, ISearchResultSet, SearchResultType,
} from 'core/search';

export interface IApplicationSearchResult extends ISearchResult {
  accounts: string[];
  application: string;
  cloudProviders: string;
  createTs: string;
  description: string;
  email: string;
  group: string;
  lastModifiedBy: string;
  legacyUdf: boolean;
  name: string;
  owner: string;
  pdApiKey: string;
  updateTs: string;
  url: string;
  user: string;
}

class ApplicationSearchResultType extends SearchResultType<IApplicationSearchResult> {
  public id = 'applications';
  public order = 1;
  public displayName = 'Applications';
  public iconClass = 'fa fa-window-maximize';

  private cols: { [key: string]: ISearchColumn } = {
    APPLICATION: { key: 'application', label: 'Name' },
    ACCOUNT: { key: 'accounts', label: 'Account' },
    EMAIL: { key: 'email' },
  };

  public TabComponent = DefaultSearchResultTab;

  public HeaderComponent = () => (
    <TableHeader>
      <HeaderCell col={this.cols.APPLICATION}/>
      <HeaderCell col={this.cols.ACCOUNT}/>
      <HeaderCell col={this.cols.EMAIL}/>
    </TableHeader>
  );

  public DataComponent = ({ resultSet }: { resultSet: ISearchResultSet<IApplicationSearchResult> }) => {
    const itemKeyFn = (item: IApplicationSearchResult) => item.application;
    const itemSortFn = (a: IApplicationSearchResult, b: IApplicationSearchResult) =>
      a.application.localeCompare(b.application);
    const results = resultSet.results.slice().sort(itemSortFn);

    return (
      <TableBody>
        {results.map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={this.cols.APPLICATION}/>
            <AccountCell item={item} col={this.cols.ACCOUNT}/>
            <BasicCell item={item} col={this.cols.EMAIL}/>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  public displayFormatter(searchResult: IApplicationSearchResult) {
    return searchResult.application;
  }
}

searchResultTypeRegistry.register(new ApplicationSearchResultType());
