import { IPromise } from 'angular';
import { $q } from 'ngimport';
import * as React from 'react';

import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry, ISearchResult,
  HeaderCell, TableBody, TableHeader, TableRow,
} from 'core/search';
import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';

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

const cols = {
  APPLICATION: { key: 'application', label: 'Name', cellRenderer: HrefCell },
  ACCOUNTS: { key: 'accounts', label: 'Account', cellRenderer: AccountCell },
  EMAIL: { key: 'email', label: 'Owner Email', cellRenderer: BasicCell },
};

const iconClass = 'fa fa-window-maximize';
const displayName = 'Applications';

const itemKeyFn = (item: IApplicationSearchResult) => item.application;
const itemSortFn = (a: IApplicationSearchResult, b: IApplicationSearchResult) =>
  a.application.localeCompare(b.application);

searchResultTypeRegistry.register({
  id: 'applications',
  order: 1,
  displayName,
  iconClass,
  displayFormatter(searchResult: IApplicationSearchResult): IPromise<string> {
    return $q.when(searchResult.application);
  },
  components: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass={iconClass} label={displayName} />
    ),

    SearchResultsHeader: () => (
      <TableHeader>
        <HeaderCell col={cols.APPLICATION}/>
        <HeaderCell col={cols.ACCOUNTS}/>
        <HeaderCell col={cols.EMAIL}/>
      </TableHeader>
    ),

    SearchResultsData: ({ results }) => (
      <TableBody>
        { results.slice().sort(itemSortFn).map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={cols.APPLICATION} />
            <AccountCell item={item} col={cols.ACCOUNTS} />
            <BasicCell item={item} col={cols.EMAIL} />
          </TableRow>
        ))}
      </TableBody>
    )
  }
});
