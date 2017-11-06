import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { ISearchResultType } from './searchResultFormatter.registry';
import { SearchResultGrid } from './SearchResultGrid';
import { SearchResultGroups } from './SearchResultGroups';
import { ISearchResultGroup } from './SearchResultGroup';

import './searchResults.less';

export enum SearchStatus {
  INITIAL, SEARCHING, FINISHED, NO_RESULTS
}

export interface ISearchResults {
  category: string;
  icon: string;
  iconClass: string;
  id: string;
  order: number;
  results: any[];
}

export interface ISearchResultsProps {
  searchStatus: SearchStatus;
  searchResultTypes: ISearchResultType[];
  searchResultCategories: ISearchResults[];
  searchResultProjects: ISearchResults[];
}

export interface ISearchResultsState {
  active: ISearchResultType;
  searchResultGroups: ISearchResultGroup[];
}

@BindAll()
export class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {

  constructor(props: ISearchResultsProps) {
    super(props);
    this.state = { active: null, searchResultGroups: this.buildGroups(props) };
  }

  public componentWillReceiveProps(newProps: ISearchResultsProps): void {
    const searchResultGroups: ISearchResultGroup[] = this.buildGroups(newProps);
    // Update 'active' to first group with any results
    const hasResults: ISearchResultGroup = searchResultGroups.find(group => group.results.length > 0);
    this.setState({ searchResultGroups, active: hasResults && hasResults.type });
  }

  private handleClick(selectedSearchResultType: ISearchResultType): void {
    this.setState({ active: selectedSearchResultType });
  }

  private buildGroups(props: ISearchResultsProps): ISearchResultGroup[] {
    const { searchResultTypes, searchResultProjects, searchResultCategories } = props;
    const searchResults = [...searchResultProjects, ...searchResultCategories];

    return searchResultTypes.map(type => {
      const resultForGroup: ISearchResults = searchResults.find(result => (result.id || result.category) === type.id);
      const results = (resultForGroup ? resultForGroup.results : []);
      return { type, results };
    });
  }

  public render(): React.ReactElement<SearchResults> {
    const { searchStatus } = this.props;
    const { active, searchResultGroups } = this.state;
    const activeGroup = active && searchResultGroups.find(group => group.type === active);

    return (
      <div className="search-results">
        <SearchResultGroups
          searchResultGroups={searchResultGroups}
          activeSearchResultType={active}
          onClick={this.handleClick}
        />

        <SearchResultGrid
          searchStatus={searchStatus}
          searchResultFormatter={active}
          searchResults={activeGroup && activeGroup.results}
        />
      </div>
    );
  }
}
