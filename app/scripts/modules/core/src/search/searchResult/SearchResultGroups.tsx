import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { ISearchResultGroup, SearchResultGroup } from './SearchResultGroup';

export interface ISearchResultGroupsProps {
  searchResultGroups: ISearchResultGroup[]
  activeSearchResultGroup: ISearchResultGroup;
  onClick?: (group: ISearchResultGroup) => void;
}

@BindAll()
export class SearchResultGroups extends React.Component<ISearchResultGroupsProps> {
  public static defaultProps: Partial<ISearchResultGroupsProps> = {
    onClick: () => {}
  };

  public render(): React.ReactElement<SearchResultGroups> {
    const { searchResultGroups, activeSearchResultGroup } = this.props;

    return (
      <div className="search-groups">
        {searchResultGroups.map(group => (
          <SearchResultGroup
            key={group.type.id}
            isActive={group === activeSearchResultGroup}
            searchResultGroup={group}
            onClick={this.props.onClick}
          />
        ))}
      </div>
    );
  }
}
