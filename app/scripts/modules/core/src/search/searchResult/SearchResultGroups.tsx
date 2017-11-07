import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { ISearchResultGroup, SearchResultGroup } from './SearchResultGroup';
import { ISearchResultType } from './searchResultsType.registry';

export interface ISearchResultGroupsProps {
  searchResultGroups: ISearchResultGroup[]
  activeSearchResultType: ISearchResultType;
  onClick?: (group: ISearchResultType) => void;
}

@BindAll()
export class SearchResultGroups extends React.Component<ISearchResultGroupsProps> {
  private handleClick(type: ISearchResultType) {
    this.props.onClick && this.props.onClick(type);
  }

  public render(): React.ReactElement<SearchResultGroups> {
    const { searchResultGroups, activeSearchResultType } = this.props;

    return (
      <div className="search-groups">
        {searchResultGroups.map(group => (
          <SearchResultGroup
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
