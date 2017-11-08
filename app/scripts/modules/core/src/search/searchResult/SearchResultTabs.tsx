import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';
import { ISearchResultData } from 'core/search/searchResult/SearchResults';
import { ISearchResultType } from './searchResultsType.registry';

export interface ISearchResultTabsProps {
  searchResultData: ISearchResultData[]
  activeSearchResultType: ISearchResultType;
  onClick?: (group: ISearchResultType) => void;
}

@BindAll()
export class SearchResultTabs extends React.Component<ISearchResultTabsProps> {
  private handleClick(type: ISearchResultType) {
    this.props.onClick && this.props.onClick(type);
  }

  public render(): React.ReactElement<SearchResultTabs> {
    const { searchResultData, activeSearchResultType } = this.props;

    return (
      <div className="search-groups">
        {searchResultData.map(group => (
          <SearchResultTab
            key={group.type.id}
            type={group.type}
            resultsCount={group.results.length}
            isActive={group.type === activeSearchResultType}
            onClick={this.handleClick}
          />
        ))}
      </div>
    );
  }
}
