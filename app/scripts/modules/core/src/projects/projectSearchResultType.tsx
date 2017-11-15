import * as React from 'react';

import {
  searchResultTypeRegistry, BasicCell, HrefCell, ISearchResult, HeaderCell, ISearchResultType,
  SearchResultTabComponent, SearchResultsHeaderComponent, SearchResultsDataComponent, DefaultSearchResultTab,
  TableBody, TableHeader, TableRow, ISearchColumn,
} from 'core/search';
import { IProjectConfig } from 'core/domain';

export interface IProjectSearchResult extends ISearchResult {
  applications: string[];
  clusters: string[];
  config: IProjectConfig;
  createTs: number;
  displayName: string;
  email: string;
  href: string;
  id: string;
  lastModifiedBy: string;
  name?: string;
  pipelineConfigId: string;
  project?: string;
  type: string;
  updateTs: number;
  url: string;
}

const cols: { [key: string]: ISearchColumn } = {
  NAME: { key: 'name' },
  EMAIL: { key: 'email' },
};

const iconClass = 'fa fa-folder-o';
const displayName = 'Projects';

const itemKeyFn = (item: IProjectSearchResult) => item.id;
const itemSortFn = (a: IProjectSearchResult, b: IProjectSearchResult) =>
  a.name.localeCompare(b.name);

const SearchResultTab: SearchResultTabComponent = ({ ...props }) => (
  <DefaultSearchResultTab {...props} iconClass={iconClass} label={displayName} />
);

const SearchResultsHeader: SearchResultsHeaderComponent = () => (
  <TableHeader>
    <HeaderCell col={cols.NAME}/>
    <HeaderCell col={cols.EMAIL}/>
  </TableHeader>
);

const SearchResultsData: SearchResultsDataComponent = ({ results }) => (
  <TableBody>
    {results.slice().sort(itemSortFn).map(item => (
      <TableRow key={itemKeyFn(item)}>
        <HrefCell item={item} col={cols.NAME} />
        <BasicCell item={item} col={cols.EMAIL} />
      </TableRow>
    ))}
  </TableBody>
);

const projectsSearchResultType: ISearchResultType = {
  id: 'projects',
  order: 0,
  iconClass,
  displayName,
  displayFormatter: (searchResult: IProjectSearchResult) => {
    const applications = searchResult.config && searchResult.config.applications ?
      ` (${searchResult.config.applications.join(', ')})` :
      '';
    const project = searchResult.name || searchResult.project;
    return project + applications;
  },
  components: {
    SearchResultTab,
    SearchResultsHeader,
    SearchResultsData,
  },
};

searchResultTypeRegistry.register(projectsSearchResultType);
